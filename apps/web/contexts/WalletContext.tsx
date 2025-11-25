"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectWallet as connectStellarWallet } from '@/lib/stellar';
import { getCreditScore } from '@/lib/api';

interface WalletContextType {
  address: string | null;
  scoreData: any;
  loading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshScore: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Restore wallet from localStorage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('wallet_address');
    if (savedAddress) {
      setAddress(savedAddress);
      fetchScore(savedAddress);
    }
  }, []);

  const fetchScore = async (addr: string) => {
    try {
      setLoading(true);
      const score = await getCreditScore(addr);
      setScoreData(score);
    } catch (error) {
      console.error('Error fetching score:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      const key = await connectStellarWallet();
      if (key) {
        setAddress(key);
        localStorage.setItem('wallet_address', key);
        await fetchScore(key);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setScoreData(null);
    localStorage.removeItem('wallet_address');
  };

  const refreshScore = async () => {
    if (address) {
      await fetchScore(address);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        scoreData,
        loading,
        connectWallet,
        disconnectWallet,
        refreshScore,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
