"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ElisaWidget from "@/components/ElisaWidget";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, TrendingUp, Wallet, Zap } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { chatWithElisa } from "@/lib/api";

export default function Home() {
  const { address, scoreData, loading, connectWallet: connect } = useWallet();
  const [elisaInsight, setElisaInsight] = useState<string>("Connect wallet to get insights.");
  const [scoreHistory, setScoreHistory] = useState<any[]>([]);

  useEffect(() => {
    if (address && scoreData) {
      fetchElisaInsight();
      fetchScoreHistory();
    }
  }, [address, scoreData]);

  const fetchElisaInsight = async () => {
    if (!address) return;
    try {
      const chat = await chatWithElisa(address, "Give me a short insight about my credit score.");
      setElisaInsight(chat.response);
    } catch (error) {
      console.error('Error fetching Elisa insight:', error);
    }
  };

  const fetchScoreHistory = async () => {
    if (!scoreData) return;
    // Simulate historical data - in production, fetch from API
    const history = [
      { date: '3 meses atrás', score: scoreData.score - 50 },
      { date: '2 meses atrás', score: scoreData.score - 30 },
      { date: '1 mês atrás', score: scoreData.score - 10 },
      { date: 'Agora', score: scoreData.score },
    ];
    setScoreHistory(history);
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <nav className="flex justify-between items-center mb-12">
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="StellarCredit" className="h-10 w-10" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            StellarCredit
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/loans" className="text-sm text-zinc-400 hover:text-white transition">Loans</Link>
          <Link href="/governance" className="text-sm text-zinc-400 hover:text-white transition">Governance</Link>
          <Link href="/pix" className="text-sm text-zinc-400 hover:text-white transition">PIX</Link>
          <Link href="/chat" className="text-sm text-zinc-400 hover:text-white transition">Chat</Link>
          <Link href="/profile" className="text-sm text-zinc-400 hover:text-white transition">Profile</Link>
          <Button 
            onClick={connect}
            className="bg-white text-black hover:bg-gray-200"
          >
            {address && typeof address === 'string' ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}` : "Connect Wallet"}
          </Button>
        </div>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Credit Score</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              {loading ? "..." : (scoreData?.score || "---")}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {scoreData?.risk_tier || "Connect Wallet"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Available Credit</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">R$ 25,000</div>
            <p className="text-xs text-zinc-500 mt-1">Estimated based on score</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">ElisaOs Insights</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300">
              {loading ? "Analyzing..." : elisaInsight}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Score History</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreHistory.length > 0 ? scoreHistory : [{date: 'Now', score: 0}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={async () => {
                if (!address) return alert("❌ Conecte sua carteira primeiro!");
                const { requestLoanOnChain } = await import("@/lib/stellar");
                const res = await requestLoanOnChain(address, 1000);
                if (res.status === "success") alert("✅ Empréstimo solicitado na blockchain!");
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Request Loan
            </Button>
            <Link href="/pix" className="block">
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
                Pay with PIX
              </Button>
            </Link>
            <Link href="/chat" className="block">
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
                Chat with ElisaOs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ElisaOs AI Widget */}
      {address && <ElisaWidget userAddress={address} position="bottom-right" />}
    </main>
  );
}
