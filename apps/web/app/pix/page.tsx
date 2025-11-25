"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, QrCode, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import Link from "next/link";

export default function PIXPage() {
  const [pixKey, setPixKey] = useState("");
  const [amount, setAmount] = useState("");
  const [qrCode, setQRCode] = useState<string | null>(null);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: "Deposit",
      amount: 1000,
      status: "Completed",
      date: "2025-11-20",
      pixKey: "user@exemplo.with"
    },
    {
      id: 2,
      type: "Withdrawal",
      amount: 500,
      status: "Pending",
      date: "2025-11-23",
      pixKey: "123.456.789-00"
    }
  ]);

  const initiateDeposit = async () => {
    // Would call PIX service SEP-24
    const mockQR = "00020126580014br.gov.bcb.pix0136user@stellarcredit.io52040000530398654042000.005802BR5913StellarCredit6009SAO_PAULO62070503***6304XXXX";
    setQRCode(mockQR);
    alert(`PIX Deposit of R$ ${amount} initiated! Scan QR code.`);
  };

  const initiateWithdrawal = async () => {
    alert(`Withdrawal of R$ ${amount} to PIX key ${pixKey} initiated!`);
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <nav className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <img src="/images/logo.png" alt="StellarCredit" className="h-8 w-8" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            PIX Operations
          </h1>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Deposit */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-green-500" />
              Deposit (PIX → BRLT)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400">Amount (BRL)</label>
              <Input
                type="number"
                placeholder="1000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <Button 
              onClick={initiateDeposit}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Generate PIX QR Code
            </Button>
            {qrCode && (
              <div className="p-4 bg-white rounded-lg text-center">
                <QrCode className="h-48 w-48 mx-auto text-black" />
                <p className="text-xs text-black mt-2">Scan with your bank app</p>
                <p className="text-xs text-zinc-600 font-mono mt-1 break-all">{qrCode.substring(0, 50)}...</p>
              </div>
            )}
            <p className="text-xs text-zinc-500">
              Daily limit: R$ 5,000 • Instant processing
            </p>
          </CardContent>
        </Card>

        {/* Withdrawal */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-red-500" />
              Withdrawal (BRLT → PIX)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400">PIX Key</label>
              <Input
                type="text"
                placeholder="CPF, email, phone, or random key"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Amount (BRL)</label>
              <Input
                type="number"
                placeholder="500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <Button 
              onClick={initiateWithdrawal}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={!pixKey || !amount}
            >
              Request Withdrawal
            </Button>
            <p className="text-xs text-zinc-500">
              Fee: 0.1% • Processing: 1-2 minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-4">
                  {tx.type === "Deposit" ? (
                    <ArrowDownCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <ArrowUpCircle className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <p className="font-semibold text-white">{tx.type}</p>
                    <p className="text-sm text-zinc-400">{tx.pixKey}</p>
                    <p className="text-xs text-zinc-500">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {tx.type === "Deposit" ? "+" : "-"}R$ {tx.amount.toLocaleString()}
                  </p>
                  <p className={`text-xs ${tx.status === "Completed" ? "text-green-500" : "text-yellow-500"}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
