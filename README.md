<div align="center">
  <img src="./Logo.png" alt="StellarCredit Logo" width="400"/>
  
  # StellarCredit
  
  ### Decentralized Credit DeFi Platform on Stellar
  
  [![Stellar](https://img.shields.io/badge/Stellar-Testnet-7D00FF?style=for-the-badge&logo=stellar)](https://stellar.org)
  [![Soroban](https://img.shields.io/badge/Soroban-Smart_Contracts-00D1FF?style=for-the-badge)](https://soroban.stellar.org)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
  
  **Decentralized Credit Scoring with AI | Global Financial Inclusion | Stellar Blockchain**
  
  [📄 Docs](./docs/) | [🌐 Demo](#quick-start) | [🇧🇷 Português](./README_PT.md)
</div>

---

## 📋 Overview

**StellarCredit** is an enterprise DeFi platform that revolutionizes credit access through:

- 🎯 **On-Chain Credit Scoring**: Immutable credit scores stored in Soroban smart contracts
- 🤖 **Predictive AI**: ML (XGBoost) for risk assessment + ElisaOs conversational AI
- 💳 **Smart Wallets**: Passkey authentication (WebAuthn) without seed phrases
- 💰 **PIX Integration**: BRL onramp/offramp using Stellar Anchor Protocol (SEP-24)
- 📊 **Real-Time Analytics**: Data streaming with Kafka + Horizon

---


## 🚀 Frontend Deploy (Vercel)

O frontend Next.js está disponível em produção nas URLs:

- [stellarcredit-web.vercel.app](https://stellarcredit-web.vercel.app)
- [stellarcredit-r45hraju5-jistrianedroid-3423s-projects.vercel.app](https://stellarcredit-r45hraju5-jistrianedroid-3423s-projects.vercel.app)

---
## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm**
- **Docker** and **Docker Compose**
- **Python** 3.11+ (optional, for backend services)
- **Rust** 1.70+ (optional, for Score service)

### Automated Installation (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/your-username/StellarCredit.git
cd StellarCredit

# 2. Run initialization script
./scripts/init.sh
```

**That's it!** The script will:
- ✅ Create `.env` file with default configuration
- ✅ Start PostgreSQL (port 5433) and Redis (port 6379)
- ✅ Install all frontend dependencies
- ✅ Start Next.js development server
- ✅ Verify everything is running

**Access**: http://localhost:3000 (wait 30-60 seconds for compilation)

### Manual Installation

If you prefer step-by-step installation:

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/StellarCredit.git
cd StellarCredit
```

#### 2️⃣ Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

**Key variables:**
```env
# Stellar Network
STELLAR_NETWORK=testnet
HORIZON_URL=https://horizon-testnet.stellar.org

# Database (PostgreSQL on port 5433)
DATABASE_URL=postgresql://stellar:stellar@localhost:5433/stellarcredit
REDIS_URL=redis://localhost:6379

# OpenAI (for ElisaOs AI)
OPENAI_API_KEY=sk-your-key-here
```

#### 3️⃣ Start Infrastructure

```bash
# Starts PostgreSQL (port 5433) and Redis (port 6379)
docker-compose up -d
```

> **Note**: PostgreSQL runs on port **5433** to avoid conflicts with local installations.

#### 4️⃣ Install & Start Frontend

```bash
cd apps/web
npm install
npm run dev
```

**Access**: http://localhost:3000

The frontend works in **demo mode** without backend. To enable full functionality:

#### ElisaOs AI (Python)
```bash
cd services/elisa-os
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

#### Risk Service (Python)
```bash
cd services/risk-service
pip install -r requirements.txt
python train_model.py
uvicorn main:app --reload --port 8000
```

#### Score Service (Rust)
```bash
cd services/score-service
cargo run --release
# Runs on port 8080
```

---

## 🔗 Deployed Smart Contracts (Stellar Testnet)

### CreditScoreContract
```
CB7DFEI3BMVT6EL3SXDTASHKMAA57C2LCW4IYHMMX3CZREIMOSH3AROU
```
[View on Stellar Expert →](https://stellar.expert/explorer/testnet/contract/CB7DFEI3BMVT6EL3SXDTASHKMAA57C2LCW4IYHMMX3CZREIMOSH3AROU)

### SmartWallet
```
CAM7ILOITXEQDL64AXUU5USONLSUQU35DRZYLLC65JFWSYZQLEG7I5K3
```

### LoanContract
```
CCQTVT7QKFG5YBDFZ76QDXDOHVFPWQKOGBHW65R5XNQEHWFZGDABYYWL
```

### GovernanceContract
```
CCYMG7GIUBGL6QW3YVD7UEB2NG26OJNSBCAE7N5TIJ6N55KJLDUNKIWL
```

---

## 📦 Project Structure

```
StellarCredit/
├── apps/web/              # Next.js 14 Frontend
│   ├── app/
│   │   ├── page.tsx       # Home
│   │   ├── loans/         # Loans management
│   │   ├── governance/    # DAO voting
│   │   ├── pix/           # PIX operations
│   │   ├── chat/          # ElisaOs AI chat
│   │   └── components/
│   │       └── ElisaWidget.tsx  # AI assistant widget
│   └── package.json
├── contracts/             # Soroban Smart Contracts (Rust)
│   ├── credit-score/
│   ├── smart-wallet/
│   ├── loan/
│   └── governance/
├── services/              # Backend Microservices
│   ├── score-service/     # Rust/Actix
│   ├── risk-service/      # Python/FastAPI + XGBoost
│   ├── pix-service/       # Node.js/Express
│   └── elisa-os/          # Python/LangChain + OpenAI
├── docs/                  # Documentation
│   ├── ELISA_INTEGRATION.md
│   ├── TRANSLATION_GUIDE.md
│   └── SECURITY_AUDIT.md
└── docker-compose.yml     # Infrastructure
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS + Shadcn/UI
- **Blockchain**: Stellar SDK + Freighter Wallet

### Backend
- **Score Service**: Rust + Actix-Web
- **Risk Service**: Python + FastAPI + XGBoost
- **PIX Service**: Node.js + Express
- **ElisaOs AI**: Python + LangChain + OpenAI
- **Database**: PostgreSQL 15 + Redis 7

### Smart Contracts
- **Framework**: Soroban (Rust)
- **Network**: Stellar Testnet

---

## 🧪 Testing

### Access Frontend
1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Use Freighter Wallet (Testnet mode)
4. Explore: Home, Loans, Governance, PIX, Chat, Profile

### API Testing
```bash
# ElisaOs AI
curl -X POST http://localhost:8001/api/v1/elisa/chat \
  -H "Content-Type: application/json" \
  -d '{"user_address": "GXXX...", "message": "What is my credit score?"}'

# Risk Service
curl -X POST http://localhost:8000/api/v1/risk/assess \
  -H "Content-Type: application/json" \
  -d '{"address": "GXXX...", "amount": 1000}'
```

---

## 📊 Service Ports

| Service | Port | Status |
|---------|------|--------|
| Frontend | 3000 | Running |
| PostgreSQL | 5433 | Docker |
| Redis | 6379 | Docker |
| ElisaOs AI | 8001 | Optional |
| Risk Service | 8000 | Optional |
| Score Service | 8080 | Optional |

---

## 🌍 Internationalization

- 🇺🇸 **English** (this file)
- 🇧🇷 **Portuguese** ([README_PT.md](./README_PT.md))

All UI text has been translated. See [TRANSLATION_GUIDE.md](./docs/TRANSLATION_GUIDE.md).

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  
  **Built with ❤️ to democratize global credit access**
  
  ⭐ Star this repo if you found it useful!
  
  ![Stellar](https://img.shields.io/badge/Powered_by-Stellar-7D00FF?style=flat-square&logo=stellar)
  ![Soroban](https://img.shields.io/badge/Built_with-Soroban-00D1FF?style=flat-square)
  
</div>
