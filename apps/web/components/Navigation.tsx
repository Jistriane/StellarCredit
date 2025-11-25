"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";

export default function Navigation() {
  const { address, connectWallet } = useWallet();

  return (
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
          onClick={connectWallet}
          className="bg-white text-black hover:bg-gray-200"
        >
          {address && typeof address === 'string' 
            ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}` 
            : "Connect Wallet"}
        </Button>
      </div>
    </nav>
  );
}
