#![cfg_attr(not(test), no_std)]
mod test;
use soroban_sdk::{
    auth::Context, contract, contracterror, contractimpl, contracttype, Address, BytesN, Env,
    TryIntoVal, Val, Vec,
};

#[contract]
pub struct SmartWalletContract;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Signer(BytesN<32>), // Ed25519 Public Key (32 bytes)
}

#[contractimpl]
impl SmartWalletContract {
    // Initialize with an initial signer (Ed25519 public key)
    pub fn initialize(env: Env, public_key: BytesN<32>) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        // Set the contract itself as the "admin" identity conceptually,
        // but we store signers.
        // For simplicity, we just store the signer.
        env.storage()
            .persistent()
            .set(&DataKey::Signer(public_key), &true);
        env.storage().instance().set(&DataKey::Admin, &true); // Mark initialized
    }

    // Add a new signer (requires auth from existing signer)
    pub fn add_signer(env: Env, new_public_key: BytesN<32>) {
        env.current_contract_address().require_auth();
        env.storage()
            .persistent()
            .set(&DataKey::Signer(new_public_key), &true);
    }

    // Remove a signer
    pub fn remove_signer(env: Env, public_key: BytesN<32>) {
        env.current_contract_address().require_auth();
        env.storage()
            .persistent()
            .remove(&DataKey::Signer(public_key));
    }

    pub fn is_signer(env: Env, public_key: BytesN<32>) -> bool {
        env.storage().persistent().has(&DataKey::Signer(public_key))
    }
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InvalidArgs = 1,
    UnknownSigner = 2,
}

// Redefine __check_auth with correct signature
#[contractimpl]
impl SmartWalletContract {
    #[allow(non_snake_case)]
    pub fn __check_auth(
        env: Env,
        signature_payload: BytesN<32>,
        args: Vec<soroban_sdk::Val>, // [public_key, signature]
        _auth_context: Vec<Context>,
    ) -> Result<(), Error> {
        // args should contain the public key used to sign and the signature.
        if args.len() != 2 {
            return Err(Error::InvalidArgs);
        }

        let public_key: BytesN<32> = args.get(0).unwrap().try_into_val(&env).unwrap();
        let signature: BytesN<64> = args.get(1).unwrap().try_into_val(&env).unwrap();

        // 1. Verify the public key is authorized
        if !env
            .storage()
            .persistent()
            .has(&DataKey::Signer(public_key.clone()))
        {
            return Err(Error::UnknownSigner);
        }

        // 2. Verify the signature (Ed25519)
        // Convert BytesN<32> to Bytes for the message argument
        let payload_bytes: soroban_sdk::Bytes = signature_payload.into();

        env.crypto()
            .ed25519_verify(&public_key, &payload_bytes, &signature);

        Ok(())
    }
}
