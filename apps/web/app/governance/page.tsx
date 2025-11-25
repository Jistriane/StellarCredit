"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import ElisaWidget from "@/components/ElisaWidget";
import { ArrowLeft, Vote, CheckCircle, XCircle, Clock } from "lucide-react";

export default function GovernancePage() {
  const [address, setAddress] = useState<string | null>(null);
  const [proposals, setProposals] = useState([
    {
      id: 1,
      title: "Reduce Interest Rate to 4.5%",
      description: "Proposal to reduce the base interest rate from 5.5% to 4.5% to attract more borrowers.",
      proposer: "GXXXXX...XXXX",
      status: "Active",
      votesFor: 12500,
      votesAgainst: 3200,
      quorum: 10000,
      endTime: "2025-12-01"
    },
    {
      id: 2,
      title: "Increase Collateral Ratio to 200%",
      description: "Increase minimum collateral ratio from 150% to 200% for better risk management.",
      proposer: "GYYYY...YYYY",
      status: "Succeeded",
      votesFor: 18000,
      votesAgainst: 2000,
      quorum: 10000,
      endTime: "2025-11-20"
    }
  ]);

  const [newProposal, setNewProposal] = useState({
    title: "",
    description: ""
  });

  const vote = (proposalId: number, support: boolean) => {
    alert(`Voted ${support ? "FOR" : "AGAINST"} proposal #${proposalId}`);
  };

  const createProposal = () => {
    alert(`Creating proposal: ${newProposal.title}`);
    setNewProposal({ title: "", description: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Succeeded": return "bg-blue-500";
      case "Defeated": return "bg-red-500";
      case "Executed": return "bg-purple-500";
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
            Governance (DAO)
          </h1>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Proposal */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Create Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400">Title</label>
              <input
                type="text"
                placeholder="Proposal title"
                value={newProposal.title}
                onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white p-2 rounded"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Description</label>
              <Textarea
                placeholder="Describe your proposal..."
                value={newProposal.description}
                onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white min-h-[150px]"
              />
            </div>
            <Button 
              onClick={createProposal}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!newProposal.title || !newProposal.description}
            >
              Submit Proposal
            </Button>
            <p className="text-xs text-zinc-500">
              Voting period: 7 days • Quorum: 10,000 votes
            </p>
          </CardContent>
        </Card>

        {/* Proposals List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Active Proposals</h2>
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-white">{proposal.title}</CardTitle>
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400">{proposal.description}</p>
                  <p className="text-xs text-zinc-500 mt-2">
                    Proposed by: {proposal.proposer} • Ends: {proposal.endTime}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Voting Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-zinc-500">For</p>
                      <p className="text-lg font-semibold text-green-500">
                        {proposal.votesFor.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-zinc-500">Against</p>
                      <p className="text-lg font-semibold text-red-500">
                        {proposal.votesAgainst.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-zinc-500">Quorum</p>
                      <p className="text-lg font-semibold text-purple-500">
                        {proposal.quorum.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>For: {((proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100).toFixed(1)}%</span>
                      <span>Against: {((proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-3 flex overflow-hidden">
                      <div 
                        className="bg-green-600"
                        style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                      />
                      <div 
                        className="bg-red-600"
                        style={{ width: `${(proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Vote Buttons */}
                  {proposal.status === "Active" && (
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={() => vote(proposal.id, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Vote For
                      </Button>
                      <Button 
                        onClick={() => vote(proposal.id, false)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Vote Against
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ElisaOs AI Widget */}
      {address && <ElisaWidget userAddress={address} position="bottom-right" />}
    </main>
  );
}
