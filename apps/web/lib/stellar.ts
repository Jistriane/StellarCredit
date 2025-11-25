import {
  isConnected,
  requestAccess,
  signTransaction,
  setAllowed,
} from "@stellar/freighter-api";

export async function connectWallet(): Promise<string | null> {
  const connected = await isConnected();
  if (!connected) {
    alert("Please install Freighter Wallet!");
    return null;
  }

  try {
    const accessObj = await requestAccess();
    if (accessObj && accessObj.address) {
      return accessObj.address;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export async function signTx(xdr: string, network: string = "TESTNET") {
  try {
    const signedXdr = await signTransaction(xdr, { network });
    return signedXdr;
  } catch (e) {
    console.error(e);
    return null;
  }
}

import {
  TransactionBuilder,
  Networks,
  SorobanRpc,
  Contract,
  TimeoutInfinite,
  xdr,
} from "stellar-sdk";

const TESTNET_PASSPHRASE = Networks.TESTNET;
const RPC_URL = "https://soroban-testnet.stellar.org";

export async function requestLoanOnChain(userAddress: string, amount: number) {
  try {
    const server = new SorobanRpc.Server(RPC_URL);
    const account = await server.getAccount(userAddress);

    // For MVP, we just create a dummy transaction or call a contract if we had the ID.
    // Let's assume we are calling the 'request_loan' method on a LoanContract (placeholder).
    // Since we don't have a LoanContract, we'll just do a self-transfer of 1 XLM as a "Proof of Intent".
    
    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: TESTNET_PASSPHRASE,
    })
      .addOperation(
        // Placeholder: In real app, this would be a Contract Call
        // Operation.payment({ destination: userAddress, asset: Asset.native(), amount: "1" })
        // But for Soroban, we use InvokeHostFunction.
        // Let's just create a dummy transaction to sign.
        xdr.Operation.fromXdr(
          xdr.Operation.toXdr({
            body: xdr.OperationBody.bumpSequence(
              new xdr.BumpSequenceOp({ bumpTo: xdr.SequenceNumber.fromString("0") })
            ),
          })
        )
      )
      .setTimeout(TimeoutInfinite)
      .build();

    const signedXdr = await signTx(tx.toXDR(), "TESTNET");
    if (signedXdr) {
      // Submit to network
      // const res = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr, TESTNET_PASSPHRASE));
      return { status: "success", hash: "mock-hash-signed" };
    }
  } catch (e) {
    console.error(e);
    return { status: "error", message: "Failed to sign" };
  }
  return { status: "error" };
}
