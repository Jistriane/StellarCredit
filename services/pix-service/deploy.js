const { Keypair, rpc, Contract, TransactionBuilder, Networks, xdr, Operation, TimeoutInfinite, StrKey, hash } = require('stellar-sdk');
const fs = require('fs');
const path = require('path');
// fetch is built-in in Node 18+

// Config
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const FRIEND_BOT = "https://friendbot.stellar.org";

async function fundAccount(publicKey) {
    console.log(`Funding ${publicKey}...`);
    const res = await fetch(`${FRIEND_BOT}?addr=${publicKey}`);
    const json = await res.json();
    console.log("Funded:", json);
}

async function deploy(wasmPath, keypair) {
    const server = new rpc.Server(RPC_URL);
    const account = await server.getAccount(keypair.publicKey());
    
    const wasmBuffer = fs.readFileSync(wasmPath);
    
    console.log(`Uploading WASM from ${wasmPath}...`);
    
    const tx = new TransactionBuilder(account, {
        fee: "100000",
        networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(Operation.uploadContractWasm({ wasm: wasmBuffer }))
    .setTimeout(TimeoutInfinite)
    .build();
    
    tx.sign(keypair);
    
    const sendRes = await server.sendTransaction(tx);
    if (sendRes.status !== "PENDING") {
        console.error("Upload failed:", sendRes);
        return null;
    }
    
    // Wait for completion
    let statusRes;
    let attempts = 0;
    while (attempts < 10) {
        await new Promise(r => setTimeout(r, 2000));
        statusRes = await server.getTransaction(sendRes.hash);
        if (statusRes.status === rpc.Api.GetTransactionStatus.SUCCESS) break;
        attempts++;
    }
    
    if (statusRes.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
        console.error("Upload transaction failed or timed out");
        return null;
    }
    
    const wasmHash = statusRes.returnValue.value(); // This might need decoding depending on SDK version
    // Actually, return value of uploadContractWasm is the hash.
    // Let's just assume we can get the hash from the operation or the result.
    // In newer SDKs, we might need to compute the hash of the WASM ourselves?
    // Yes, hash(wasmBuffer).
    
    // Actually, let's just create the contract using the WASM hash.
    // But wait, we need the WASM hash to create the contract.
    // We can compute it locally.
    const crypto = require('crypto');
    const computedHash = crypto.createHash('sha256').update(wasmBuffer).digest();
    
    console.log(`WASM Hash: ${computedHash.toString('hex')}`);
    
    // Create Contract
    console.log("Creating Contract Instance...");
    // We need to reload account for sequence number
    const account2 = await server.getAccount(keypair.publicKey());
    
    const createTx = new TransactionBuilder(account2, {
        fee: "10000",
        networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(Operation.createContract({
        wasmHash: computedHash,
        address: keypair.publicKey(), // Deployer
    })) // Note: In newer SDKs, createContract takes { wasmHash } and generates ID?
    // Actually, Operation.createContract({ wasmHash }) creates a contract.
    .setTimeout(TimeoutInfinite)
    .build();
    
    createTx.sign(keypair);
    
    const createRes = await server.sendTransaction(createTx);
     if (createRes.status !== "PENDING") {
        console.error("Create failed:", createRes);
        return null;
    }
    
    // Wait
    let createStatus;
    attempts = 0;
    while (attempts < 10) {
        await new Promise(r => setTimeout(r, 2000));
        createStatus = await server.getTransaction(createRes.hash);
        if (createStatus.status === rpc.Api.GetTransactionStatus.SUCCESS) break;
        attempts++;
    }
    
    if (createStatus.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
        console.error("Create transaction failed");
        return null;
    }
    
    // The contract ID is in the return value or meta.
    // For simplicity, we can't easily parse it here without XDR decoding helpers.
    // But we can print the transaction hash and ask user to check explorer?
    // Or we can try to decode.
    
    console.log(`Contract Deployed! Tx Hash: ${createRes.hash}`);
    return createRes.hash;
}

async function main() {
    const keypair = Keypair.random();
    console.log(`Generated Deployer: ${keypair.publicKey()} / ${keypair.secret()}`);
    
    await fundAccount(keypair.publicKey());
    
    const creditScoreWasm = path.resolve(__dirname, '../../contracts/credit-score/target/wasm32-unknown-unknown/release/credit_score.wasm');
    const smartWalletWasm = path.resolve(__dirname, '../../contracts/smart-wallet/target/wasm32-unknown-unknown/release/smart_wallet.wasm');
    
    console.log("Deploying Credit Score Contract...");
    await deploy(creditScoreWasm, keypair);
    
    console.log("Deploying Smart Wallet Contract...");
    await deploy(smartWalletWasm, keypair);
}

main().catch(console.error);
