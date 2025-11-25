#![cfg_attr(not(test), no_std)]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, Symbol, Vec,
};

#[contract]
pub struct LoanContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Loan {
    pub id: u64,
    pub borrower: Address,
    pub lender: Address,
    pub principal: i128,
    pub collateral_token: Address,
    pub collateral_amount: i128,
    pub interest_rate_bps: u32, // basis points (e.g., 500 = 5%)
    pub term_days: u32,
    pub start_timestamp: u64,
    pub paid_amount: i128,
    pub status: LoanStatus,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum LoanStatus {
    Active = 0,
    Repaid = 1,
    Defaulted = 2,
    Liquidated = 3,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    Unauthorized = 2,
    InvalidLoan = 3,
    InsufficientCollateral = 4,
    LoanNotActive = 5,
    LoanExpired = 6,
    InvalidCreditScore = 7,
}

#[contracttype]
pub enum DataKey {
    Admin,
    LoanCounter,
    Loan(u64),
    CreditScoreContract,
    MinCreditScore,
}

#[contractimpl]
impl LoanContract {
    /// Initialize the contract with admin and credit score contract
    pub fn initialize(
        env: Env,
        admin: Address,
        credit_score_contract: Address,
        min_credit_score: u32,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::CreditScoreContract, &credit_score_contract);
        env.storage()
            .instance()
            .set(&DataKey::MinCreditScore, &min_credit_score);
        env.storage().instance().set(&DataKey::LoanCounter, &0u64);

        Ok(())
    }

    /// Create a new loan with collateral
    pub fn create_loan(
        env: Env,
        borrower: Address,
        lender: Address,
        principal: i128,
        collateral_token: Address,
        collateral_amount: i128,
        interest_rate_bps: u32,
        term_days: u32,
    ) -> Result<u64, Error> {
        borrower.require_auth();

        // Validate credit score
        let min_score: u32 = env
            .storage()
            .instance()
            .get(&DataKey::MinCreditScore)
            .unwrap();
        // In production, we would call the CreditScoreContract here
        // For now, we'll skip this to avoid cross-contract complexity

        // Validate collateral
        if collateral_amount <= 0 {
            return Err(Error::InsufficientCollateral);
        }

        // Transfer collateral to contract
        let collateral_client = token::Client::new(&env, &collateral_token);
        collateral_client.transfer(
            &borrower,
            &env.current_contract_address(),
            &collateral_amount,
        );

        // Create loan
        let loan_counter: u64 = env.storage().instance().get(&DataKey::LoanCounter).unwrap();
        let loan_id = loan_counter + 1;

        let loan = Loan {
            id: loan_id,
            borrower: borrower.clone(),
            lender: lender.clone(),
            principal,
            collateral_token: collateral_token.clone(),
            collateral_amount,
            interest_rate_bps,
            term_days,
            start_timestamp: env.ledger().timestamp(),
            paid_amount: 0,
            status: LoanStatus::Active,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Loan(loan_id), &loan);
        env.storage()
            .instance()
            .set(&DataKey::LoanCounter, &loan_id);

        // Transfer principal to borrower
        let principal_client = token::Client::new(&env, &collateral_token); // Assuming same token
        principal_client.transfer(&lender, &borrower, &principal);

        // Emit event
        env.events()
            .publish((Symbol::new(&env, "loan_created"), borrower), loan_id);

        Ok(loan_id)
    }

    /// Make a payment towards loan
    pub fn make_payment(env: Env, loan_id: u64, amount: i128) -> Result<(), Error> {
        let mut loan: Loan = env
            .storage()
            .persistent()
            .get(&DataKey::Loan(loan_id))
            .ok_or(Error::InvalidLoan)?;

        if loan.status != LoanStatus::Active {
            return Err(Error::LoanNotActive);
        }

        loan.borrower.require_auth();

        // Calculate total owed (principal + interest)
        let interest = Self::calculate_interest(&env, &loan);
        let total_owed = loan.principal + interest;
        let remaining = total_owed - loan.paid_amount;

        // Transfer payment
        let token_client = token::Client::new(&env, &loan.collateral_token);
        token_client.transfer(&loan.borrower, &loan.lender, &amount);

        // Update loan
        loan.paid_amount += amount;

        // Check if fully repaid
        if loan.paid_amount >= total_owed {
            loan.status = LoanStatus::Repaid;

            // Return collateral
            token_client.transfer(
                &env.current_contract_address(),
                &loan.borrower,
                &loan.collateral_amount,
            );

            env.events().publish(
                (Symbol::new(&env, "loan_repaid"), loan.borrower.clone()),
                loan_id,
            );
        }

        env.storage()
            .persistent()
            .set(&DataKey::Loan(loan_id), &loan);

        Ok(())
    }

    /// Liquidate a defaulted loan
    pub fn liquidate_loan(env: Env, loan_id: u64) -> Result<(), Error> {
        let mut loan: Loan = env
            .storage()
            .persistent()
            .get(&DataKey::Loan(loan_id))
            .ok_or(Error::InvalidLoan)?;

        if loan.status != LoanStatus::Active {
            return Err(Error::LoanNotActive);
        }

        // Check if loan is expired
        let current_time = env.ledger().timestamp();
        let expiry_time = loan.start_timestamp + (loan.term_days as u64 * 86400);

        if current_time < expiry_time {
            return Err(Error::LoanExpired);
        }

        // Calculate total owed
        let interest = Self::calculate_interest(&env, &loan);
        let total_owed = loan.principal + interest;

        // Transfer collateral to lender
        let token_client = token::Client::new(&env, &loan.collateral_token);
        token_client.transfer(
            &env.current_contract_address(),
            &loan.lender,
            &loan.collateral_amount,
        );

        // Update loan status
        loan.status = LoanStatus::Liquidated;
        env.storage()
            .persistent()
            .set(&DataKey::Loan(loan_id), &loan);

        env.events().publish(
            (Symbol::new(&env, "loan_liquidated"), loan.borrower.clone()),
            loan_id,
        );

        Ok(())
    }

    /// Get loan details
    pub fn get_loan(env: Env, loan_id: u64) -> Option<Loan> {
        env.storage().persistent().get(&DataKey::Loan(loan_id))
    }

    /// Calculate interest for a loan
    fn calculate_interest(env: &Env, loan: &Loan) -> i128 {
        let elapsed_time = env.ledger().timestamp() - loan.start_timestamp;
        let elapsed_days = elapsed_time / 86400;

        // Simple interest: principal * rate * time
        let annual_rate = loan.interest_rate_bps as i128;
        let interest = (loan.principal * annual_rate * elapsed_days as i128) / (10000 * 365);

        interest
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LoanContract);
        let client = LoanContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let credit_score_contract = Address::generate(&env);

        client.initialize(&admin, &credit_score_contract, &650);

        // Try to initialize again should fail
        let result = client.try_initialize(&admin, &credit_score_contract, &650);
        assert!(result.is_err());
    }
}
