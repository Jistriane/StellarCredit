
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ElisaWidget from "@/components/ElisaWidget";
import { ArrowLeft, TrendingUp, Clock, DollarSign } from "lucide-react";

export default function LoansPage() {
  const [loans, setLoans] = useState([
    {
      id: 1,
      principal: 5000,
      collateral: 10000,
      interestRate: 5.5,
      termDays: 30,
      status: "Active",
      paidAmount: 1200,
      dueDate: "2025-12-24"
    },
    {
      id: 2,
      principal: 2000,
      collateral: 4000,
      interestRate: 6.0,
      termDays: 15,
      status: "Repaid",
      paidAmount: 2000,
      dueDate: "2025-11-10"
    }
  ]);

  const [newLoan, setNewLoan] = useState({
    amount: "",
    collateral: "",
    term: "30"
  });

  const createLoan = async () => {
    // Placeholder - will integrate with smart contract
    alert(`Creating loan: ${newLoan.amount} BRL with ${newLoan.collateral} XLM collateral`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Repaid": return "bg-blue-500";
      case "Defaulted": return "bg-red-500";
      default: return "bg-gray-500";
    }
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
            My Loans
          </h1>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create New Loan */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Create New Loan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400">Loan Amount (BRL)</label>
              <Input
                type="number"
                placeholder="5000"
                value={newLoan.amount}
                onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Collateral (XLM)</label>
              <Input
                type="number"
                placeholder="10000"
                value={newLoan.collateral}
                onChange={(e) => setNewLoan({ ...newLoan, collateral: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Term (Days)</label>
              <select 
                value={newLoan.term}
                onChange={(e) => setNewLoan({ ...newLoan, term: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white p-2 rounded"
              >
                <option value="15">15 Days</option>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
            <Button 
              onClick={createLoan}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Create Loan
            </Button>
            <p className="text-xs text-zinc-500">
              Interest rate: 5.5% • Estimated monthly payment: R$ 175
            </p>
          </CardContent>
        </Card>

        {/* Active Loans */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Active Loans</h2>
          {loans.map((loan) => (
            <Card key={loan.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Loan #{loan.id}</CardTitle>
                  <p className="text-sm text-zinc-500">Due: {loan.dueDate}</p>
                </div>
                <Badge className={getStatusColor(loan.status)}>
                  {loan.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-zinc-500">Principal</p>
                    <p className="text-lg font-semibold text-white">R$ {loan.principal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Collateral</p>
                    <p className="text-lg font-semibold text-white">{loan.collateral.toLocaleString()} XLM</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Interest Rate</p>
                    <p className="text-lg font-semibold text-white">{loan.interestRate}%</p>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 mb-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(loan.paidAmount / loan.principal) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Paid: R$ {loan.paidAmount.toLocaleString()}</span>
                  <span>Remaining: R$ {(loan.principal - loan.paidAmount).toLocaleString()}</span>
                </div>
                {loan.status === "Active" && (
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                    Make Payment
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </main>
  );
}

