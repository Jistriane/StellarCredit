#!/bin/bash
set -e

# Generate identity if not exists
soroban keys generate alice || true

echo "Funding alice..."
curl "https://friendbot.stellar.org/?addr=$(soroban keys address alice)"

echo "Deploying Credit Score Contract..."
CREDIT_SCORE_ID=$(soroban contract deploy \
    --wasm contracts/credit-score/target/wasm32-unknown-unknown/release/credit_score.wasm \
    --source alice \
    --network testnet)
echo "Credit Score Contract ID: $CREDIT_SCORE_ID"

echo "Deploying Smart Wallet Contract..."
SMART_WALLET_ID=$(soroban contract deploy \
    --wasm contracts/smart-wallet/target/wasm32-unknown-unknown/release/smart_wallet.wasm \
    --source alice \
    --network testnet)
echo "Smart Wallet Contract ID: $SMART_WALLET_ID"

echo "Deploying Loan Contract..."
LOAN_ID=$(soroban contract deploy \
    --wasm contracts/loan/target/wasm32-unknown-unknown/release/loan_contract.wasm \
    --source alice \
    --network testnet)
echo "Loan Contract ID: $LOAN_ID"

echo "Deploying Governance Contract..."
GOVERNANCE_ID=$(soroban contract deploy \
    --wasm contracts/governance/target/wasm32-unknown-unknown/release/governance_contract.wasm \
    --source alice \
    --network testnet)
echo "Governance Contract ID: $GOVERNANCE_ID"

# Save to file
echo "Credit Score: $CREDIT_SCORE_ID" > deployed_contracts.txt
echo "Smart Wallet: $SMART_WALLET_ID" >> deployed_contracts.txt
echo "Loan: $LOAN_ID" >> deployed_contracts.txt
echo "Governance: $GOVERNANCE_ID" >> deployed_contracts.txt

echo ""
echo "✅ All contracts deployed successfully!"
echo "Check deployed_contracts.txt for IDs"
