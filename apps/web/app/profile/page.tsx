"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, CreditCard, Settings, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    address: "GXXXXX...XXXX",
    name: "John Doe",
    email: "john@example.with",
    kycStatus: "Verified",
    memberSince: "2024-01-15",
    creditScore: 750,
    totalLoans: 3,
    activeLoans: 1,
    totalBorrowed: 12000,
    totalRepaid: 7000
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userData.name);
  const [editedEmail, setEditedEmail] = useState(userData.email);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [copied, setCopied] = useState(false);

  // Simulated recovery phrase - in production this would come from the wallet
  const recoveryPhrase = "galaxy moon stellar credit trust wallet secure finance decentralized blockchain";

  const handleEnableTwoFactor = () => {
    if (twoFactorEnabled) {
      if (confirm("Deseja desabilitar a autenticação de dois fatores?")) {
        setTwoFactorEnabled(false);
        alert("✅ 2FA desabilitado com sucesso!");
      }
    } else {
      // Simulate 2FA setup
      alert("🔐 Configuração de 2FA:\n\n1. Baixe um app autenticador (Google Authenticator, Authy)\n2. Escaneie o QR code\n3. Digite o código de 6 dígitos\n\n(Simulação - em produção, seria um QR code real)");
      setTwoFactorEnabled(true);
    }
  };

  const handleViewRecoveryPhrase = () => {
    if (confirm("⚠️ ATENÇÃO: Nunca compartilhe sua frase de recuperação!\n\nDeseja visualizar sua frase de recuperação?")) {
      setShowRecoveryPhrase(true);
    }
  };

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(recoveryPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManageDevices = () => {
    setShowDevices(!showDevices);
  };

  const handleEditProfile = () => {
    if (isEditing) {
      // Cancel editing
      setEditedName(userData.name);
      setEditedEmail(userData.email);
      setIsEditing(false);
    } else {
      // Start editing
      setIsEditing(true);
    }
  };

  const handleSaveProfile = () => {
    if (!editedName.trim()) {
      alert("❌ O nome não pode estar vazio!");
      return;
    }
    if (!editedEmail.trim() || !editedEmail.includes('@')) {
      alert("❌ Por favor, insira um email válido!");
      return;
    }
    
    setUserData({
      ...userData,
      name: editedName,
      email: editedEmail
    });
    setIsEditing(false);
    alert("✅ Perfil atualizado com sucesso!");
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
            My Profile
          </h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-4xl font-bold">
                {userData.name.charAt(0)}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Nome</label>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Email</label>
                      <input
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
                    <p className="text-zinc-400">{userData.email}</p>
                  </>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Wallet className="h-4 w-4 text-purple-500" />
                  <p className="text-sm font-mono text-zinc-500">{userData.address}</p>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                    {userData.kycStatus}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Member since {userData.memberSince}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button 
                      onClick={handleSaveProfile}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Salvar
                    </Button>
                    <Button 
                      onClick={handleEditProfile}
                      variant="outline" 
                      className="border-zinc-700"
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleEditProfile}
                    variant="outline" 
                    className="border-zinc-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500">Credit Score</p>
              <p className="text-2xl font-bold text-purple-500">{userData.creditScore}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500">Total Loans</p>
              <p className="text-2xl font-bold text-white">{userData.totalLoans}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500">Active Loans</p>
              <p className="text-2xl font-bold text-green-500">{userData.activeLoans}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500">Total Borrowed</p>
              <p className="text-2xl font-bold text-white">R$ {userData.totalBorrowed.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-zinc-800 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-white font-semibold">Loan Payment</p>
                  <p className="text-xs text-zinc-500">November 23, 2025</p>
                </div>
                <p className="text-white font-semibold">-R$ 500</p>
              </div>
              <div className="flex items-center gap-4 p-3 bg-zinc-800 rounded-lg">
                <Wallet className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <p className="text-white font-semibold">PIX Deposit</p>
                  <p className="text-xs text-zinc-500">November 20, 2025</p>
                </div>
                <p className="text-green-500 font-semibold">+R$ 1,000</p>
              </div>
              <div className="flex items-center gap-4 p-3 bg-zinc-800 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-white font-semibold">Loan Created</p>
                  <p className="text-xs text-zinc-500">November 15, 2025</p>
                </div>
                <p className="text-white font-semibold">R$ 5,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Two-Factor Authentication</p>
                <p className="text-xs text-zinc-500">Add extra security to your account</p>
              </div>
              <Button 
                onClick={handleEnableTwoFactor}
                variant="outline" 
                className={twoFactorEnabled ? "border-green-500 text-green-500" : "border-zinc-700"}
              >
                {twoFactorEnabled ? "Enabled ✓" : "Enable"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Recovery Phrase</p>
                <p className="text-xs text-zinc-500">Backup your wallet access</p>
              </div>
              <Button 
                onClick={handleViewRecoveryPhrase}
                variant="outline" 
                className="border-zinc-700"
              >
                View
              </Button>
            </div>

            {showRecoveryPhrase && (
              <div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-yellow-500 font-semibold text-sm">⚠️ Frase de Recuperação</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyPhrase}
                    className="text-xs"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-white font-mono text-sm bg-black p-3 rounded">
                  {recoveryPhrase}
                </p>
                <p className="text-xs text-yellow-400 mt-2">
                  ⚠️ Guarde esta frase em um local seguro. Nunca compartilhe com ninguém!
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Connected Devices</p>
                <p className="text-xs text-zinc-500">Manage your active sessions</p>
              </div>
              <Button 
                onClick={handleManageDevices}
                variant="outline" 
                className="border-zinc-700"
              >
                {showDevices ? "Hide" : "Manage"}
              </Button>
            </div>

            {showDevices && (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">💻 Chrome - Linux</p>
                      <p className="text-xs text-zinc-500">São Paulo, Brasil • Ativo agora</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-green-500 text-xs">
                      Atual
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">📱 Mobile Safari - iOS</p>
                      <p className="text-xs text-zinc-500">Rio de Janeiro, Brasil • Há 2 dias</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-500 text-xs">
                      Revogar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
