#![cfg_attr(not(test), no_std)]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, Address, Env, Map, Symbol, Vec,
};

#[contract]
pub struct GovernanceContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Proposal {
    pub id: u64,
    pub proposer: Address,
    pub title: Symbol,
    pub description: Symbol,
    pub start_time: u64,
    pub end_time: u64,
    pub votes_for: i128,
    pub votes_against: i128,
    pub status: ProposalStatus,
    pub quorum_required: i128,
    pub execution_delay: u64,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ProposalStatus {
    Active = 0,
    Succeeded = 1,
    Defeated = 2,
    Queued = 3,
    Executed = 4,
    Cancelled = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Vote {
    pub voter: Address,
    pub proposal_id: u64,
    pub support: bool,
    pub weight: i128,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    Unauthorized = 2,
    InvalidProposal = 3,
    ProposalNotActive = 4,
    AlreadyVoted = 5,
    VotingEnded = 6,
    QuorumNotReached = 7,
    TimelockNotExpired = 8,
    InsufficientVotingPower = 9,
}

#[contracttype]
pub enum DataKey {
    Admin,
    ProposalCounter,
    Proposal(u64),
    Vote(Address, u64),
    VotingToken,
    QuorumPercentage,
    TimelockDelay,
}

#[contractimpl]
impl GovernanceContract {
    /// Initialize governance contract
    pub fn initialize(
        env: Env,
        admin: Address,
        voting_token: Address,
        quorum_percentage: u32, // e.g., 40 = 40%
        timelock_delay: u64,    // in seconds
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::VotingToken, &voting_token);
        env.storage()
            .instance()
            .set(&DataKey::QuorumPercentage, &quorum_percentage);
        env.storage()
            .instance()
            .set(&DataKey::TimelockDelay, &timelock_delay);
        env.storage()
            .instance()
            .set(&DataKey::ProposalCounter, &0u64);

        Ok(())
    }

    /// Create a new proposal
    pub fn create_proposal(
        env: Env,
        proposer: Address,
        title: Symbol,
        description: Symbol,
        voting_period: u64, // in seconds
    ) -> Result<u64, Error> {
        proposer.require_auth();

        // Get next proposal ID
        let proposal_counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::ProposalCounter)
            .unwrap();
        let proposal_id = proposal_counter + 1;

        let current_time = env.ledger().timestamp();
        let timelock_delay: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TimelockDelay)
            .unwrap();

        // Calculate quorum required (simplified: total supply * quorum_percentage / 100)
        // In production, would query token contract for total supply
        let quorum_percentage: u32 = env
            .storage()
            .instance()
            .get(&DataKey::QuorumPercentage)
            .unwrap();
        let quorum_required: i128 = 1000000; // Placeholder - would calculate from token supply

        let proposal = Proposal {
            id: proposal_id,
            proposer: proposer.clone(),
            title,
            description,
            start_time: current_time,
            end_time: current_time + voting_period,
            votes_for: 0,
            votes_against: 0,
            status: ProposalStatus::Active,
            quorum_required,
            execution_delay: timelock_delay,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Proposal(proposal_id), &proposal);
        env.storage()
            .instance()
            .set(&DataKey::ProposalCounter, &proposal_id);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "proposal_created"), proposer),
            proposal_id,
        );

        Ok(proposal_id)
    }

    /// Cast a vote on a proposal
    pub fn vote(env: Env, voter: Address, proposal_id: u64, support: bool) -> Result<(), Error> {
        voter.require_auth();

        // Load proposal
        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposal(proposal_id))
            .ok_or(Error::InvalidProposal)?;

        // Check proposal is active
        if proposal.status != ProposalStatus::Active {
            return Err(Error::ProposalNotActive);
        }

        // Check voting period hasn't ended
        let current_time = env.ledger().timestamp();
        if current_time > proposal.end_time {
            return Err(Error::VotingEnded);
        }

        // Check if already voted
        if env
            .storage()
            .persistent()
            .has(&DataKey::Vote(voter.clone(), proposal_id))
        {
            return Err(Error::AlreadyVoted);
        }

        // Get voting power (token balance)
        // In production, would query token contract
        let voting_power: i128 = 100; // Placeholder

        if voting_power == 0 {
            return Err(Error::InsufficientVotingPower);
        }

        // Record vote
        let vote = Vote {
            voter: voter.clone(),
            proposal_id,
            support,
            weight: voting_power,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Vote(voter.clone(), proposal_id), &vote);

        // Update proposal tallies
        if support {
            proposal.votes_for += voting_power;
        } else {
            proposal.votes_against += voting_power;
        }

        env.storage()
            .persistent()
            .set(&DataKey::Proposal(proposal_id), &proposal);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "vote_cast"), voter),
            (proposal_id, support),
        );

        Ok(())
    }

    /// Finalize voting and determine outcome
    pub fn finalize_proposal(env: Env, proposal_id: u64) -> Result<(), Error> {
        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposal(proposal_id))
            .ok_or(Error::InvalidProposal)?;

        if proposal.status != ProposalStatus::Active {
            return Err(Error::ProposalNotActive);
        }

        let current_time = env.ledger().timestamp();
        if current_time <= proposal.end_time {
            return Err(Error::VotingEnded);
        }

        // Check quorum
        let total_votes = proposal.votes_for + proposal.votes_against;
        if total_votes < proposal.quorum_required {
            proposal.status = ProposalStatus::Defeated;
        } else if proposal.votes_for > proposal.votes_against {
            proposal.status = ProposalStatus::Succeeded;
        } else {
            proposal.status = ProposalStatus::Defeated;
        }

        env.storage()
            .persistent()
            .set(&DataKey::Proposal(proposal_id), &proposal);

        env.events().publish(
            (Symbol::new(&env, "proposal_finalized"), proposal_id),
            proposal.status,
        );

        Ok(())
    }

    /// Queue a succeeded proposal for execution (timelock)
    pub fn queue_proposal(env: Env, proposal_id: u64) -> Result<(), Error> {
        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposal(proposal_id))
            .ok_or(Error::InvalidProposal)?;

        if proposal.status != ProposalStatus::Succeeded {
            return Err(Error::QuorumNotReached);
        }

        proposal.status = ProposalStatus::Queued;
        env.storage()
            .persistent()
            .set(&DataKey::Proposal(proposal_id), &proposal);

        Ok(())
    }

    /// Execute a queued proposal (after timelock)
    pub fn execute_proposal(env: Env, proposal_id: u64) -> Result<(), Error> {
        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposal(proposal_id))
            .ok_or(Error::InvalidProposal)?;

        if proposal.status != ProposalStatus::Queued {
            return Err(Error::QuorumNotReached);
        }

        // Check timelock has expired
        let current_time = env.ledger().timestamp();
        let execution_time = proposal.end_time + proposal.execution_delay;

        if current_time < execution_time {
            return Err(Error::TimelockNotExpired);
        }

        // Execute proposal actions (would call target contracts here)
        // For now, just mark as executed
        proposal.status = ProposalStatus::Executed;
        env.storage()
            .persistent()
            .set(&DataKey::Proposal(proposal_id), &proposal);

        env.events().publish(
            (Symbol::new(&env, "proposal_executed"), proposal_id),
            current_time,
        );

        Ok(())
    }

    /// Get proposal details
    pub fn get_proposal(env: Env, proposal_id: u64) -> Option<Proposal> {
        env.storage()
            .persistent()
            .get(&DataKey::Proposal(proposal_id))
    }

    /// Cancel a proposal (admin only)
    pub fn cancel_proposal(env: Env, proposal_id: u64) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposal(proposal_id))
            .ok_or(Error::InvalidProposal)?;

        proposal.status = ProposalStatus::Cancelled;
        env.storage()
            .persistent()
            .set(&DataKey::Proposal(proposal_id), &proposal);

        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_governance_flow() {
        let env = Env::default();
        let contract_id = env.register_contract(None, GovernanceContract);
        let client = GovernanceContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let voting_token = Address::generate(&env);
        let proposer = Address::generate(&env);

        // Initialize
        client.initialize(&admin, &voting_token, &40, &86400);

        // Create proposal
        let title = Symbol::new(&env, "PROPOSAL_1");
        let desc = Symbol::new(&env, "Test");
        let proposal_id = client.create_proposal(&proposer, &title, &desc, &604800);

        assert_eq!(proposal_id, 1);

        // Get proposal
        let proposal = client.get_proposal(&proposal_id).unwrap();
        assert_eq!(proposal.status, ProposalStatus::Active);
    }
}
