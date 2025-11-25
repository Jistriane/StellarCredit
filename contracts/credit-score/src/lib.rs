#![cfg_attr(not(test), no_std)]
mod test;
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec};

#[contract]
pub struct CreditScoreContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ScoreData {
    pub score: u32,
    pub confidence: u32, // Basis points (0-10000)
    pub timestamp: u64,
    pub version: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Score(Address),
    Version(Address),
}

#[contractimpl]
impl CreditScoreContract {
    // Initialize contract with admin
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    // Store score (only authorized oracles/admin)
    // For simplicity in this MVP, only the admin can update scores.
    // In a real scenario, we would have a list of authorized oracles.
    pub fn store_score(env: Env, user: Address, score: u32, confidence: u32, timestamp: u64) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        // Validate score range (300-850)
        if score < 300 || score > 850 {
            panic!("Invalid score range");
        }

        let current_version = env
            .storage()
            .persistent()
            .get(&DataKey::Version(user.clone()))
            .unwrap_or(0);

        let next_version = current_version + 1;

        let score_data = ScoreData {
            score,
            confidence,
            timestamp,
            version: next_version,
        };

        // Store the score
        env.storage()
            .persistent()
            .set(&DataKey::Score(user.clone()), &score_data);

        // Update version
        env.storage()
            .persistent()
            .set(&DataKey::Version(user.clone()), &next_version);

        // Emit event
        env.events()
            .publish((Symbol::new(&env, "score_updated"), user), score_data);
    }

    // Get latest score (public read)
    pub fn get_score(env: Env, user: Address) -> Option<ScoreData> {
        env.storage().persistent().get(&DataKey::Score(user))
    }
}
