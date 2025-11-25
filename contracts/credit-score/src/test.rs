#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_store_and_get_score() {
    let env = Env::default();
    let contract_id = env.register_contract(None, CreditScoreContract);
    let client = CreditScoreContractClient::new(&env, &contract_id);

    // Workaround for Address generation issues in rc.2
    let admin = contract_id.clone(); // Use contract itself as admin for simplicity or generate another

    // Generate a random-ish address for user
    let user_bytes = [0u8; 32];
    let user_hash = soroban_sdk::BytesN::from_array(&env, &user_bytes);
    let user = Address::from_contract_id(&user_hash);

    // Initialize
    client.initialize(&admin);

    // Store score
    client
        .mock_all_auths()
        .store_score(&user, &750, &9000, &1234567890);

    // Get score
    let score_data = client.get_score(&user).unwrap();

    assert_eq!(score_data.score, 750);
    assert_eq!(score_data.confidence, 9000);
    assert_eq!(score_data.timestamp, 1234567890);
    assert_eq!(score_data.version, 1);
}

#[test]
#[should_panic(expected = "Invalid score range")]
fn test_invalid_score_range() {
    let env = Env::default();
    let contract_id = env.register_contract(None, CreditScoreContract);
    let client = CreditScoreContractClient::new(&env, &contract_id);

    let admin = contract_id.clone();

    let user_bytes = [1u8; 32]; // Different byte
    let user_hash = soroban_sdk::BytesN::from_array(&env, &user_bytes);
    let user = Address::from_contract_id(&user_hash);

    client.initialize(&admin);

    // Should panic
    client
        .mock_all_auths()
        .store_score(&user, &900, &9000, &1234567890);
}
