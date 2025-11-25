<div align="center">
  <img src="./Logo.png" alt="StellarCredit Logo" width="400"/>
  
  # StellarCredit
  
  ### Plataforma DeFi de Crédito Descentralizado na Stellar
  
  [![Stellar](https://img.shields.io/badge/Stellar-Testnet-7D00FF?style=for-the-badge&logo=stellar)](https://stellar.org)
  [![Soroban](https://img.shields.io/badge/Soroban-Smart_Contracts-00D1FF?style=for-the-badge)](https://soroban.stellar.org)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
  [![Rust](https://img.shields.io/badge/Rust-Actix_Web-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org)
  [![Python](https://img.shields.io/badge/Python-FastAPI-blue?style=for-the-badge&logo=python)](https://fastapi.tiangolo.com)
  
  **Credit Scoring Descentralizado com IA | Inclusão Financeira Global | Blockchain Stellar**
  
  [🌐 Live Demo](#) | [📄 Docs](./docs/) | [🚀 Deploy](#quick-start) | [💬 Community](#)
</div>

---

## 📋 Visão Geral

**StellarCredit** é uma plataforma DeFi enterprise que revoluciona o acesso ao crédito através de:

- 🎯 **Credit Scoring On-Chain**: Scores de crédito imutáveis armazenados em smart contracts Soroban
- 🤖 **IA Preditiva**: Machine Learning (XGBoost) para avaliação de risco e detecção de fraude
- 💳 **Smart Wallets**: Autenticação via Passkey (WebAuthn) sem seed phrases
- 💰 **Integração PIX**: Onramp/offramp BRL usando Stellar Anchor Protocol (SEP-24/31)
- 🗣️ **ElisaOs AI**: Agente conversacional para educação financeira e insights
- 📊 **Analytics em Tempo Real**: Data streaming com Kafka + Horizon SSE

---

## ✨ Features Principais

### 🔗 Blockchain & Smart Contracts
- ✅ **CreditScoreContract** deployado na Testnet Stellar
- ✅ **SmartWallet** com suporte a multi-sig e custom auth
- ✅ **LoanContract** para empréstimos on-chain com garantia
- ✅ **GovernanceContract** para votação DAO e propostas
- 🔄 Versionamento imutável de scores
- 📢 Event emission para tracking on-chain

### 🤖 Machine Learning & IA
- ✅ Modelo XGBoost treinado para risk scoring
- ✅ Feature engineering de transações Stellar
- ✅ ElisaOs: AI conversacional com LangChain + OpenAI
- 🔄 Data pipeline com Kafka para streaming de transações

### 💻 Frontend Moderno
- ✅ Next.js 14 (App Router) + TypeScript
- ✅ Integração Freighter Wallet
- ✅ UI/UX com TailwindCSS + Shadcn/UI
- ✅ Recharts para visualização de dados
- ✅ ElisaWidget - Assistente AI flutuante
- 🔄 Transaction signing via Soroban SDK

### 🛠️ Backend Escalável
- ✅ 5 microsserviços (Rust, Python, Node.js)
- ✅ API Gateway (Kong)
- ✅ PostgreSQL, Redis, Kafka
- ✅ Docker Compose para ambiente local
- ✅ GraphQL Federation (Apollo)

### 🔐 Segurança & Compliance
- ✅ Preparação para auditoria de smart contracts
- ✅ Documentação de compliance LGPD
- ✅ Pontos de integração KYC/AML
- ✅ Checklist de hardening de produção

---

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** 18+ e **npm**
- **Docker** e **Docker Compose**
- **Python** 3.11+ (opcional, para serviços backend)
- **Rust** 1.70+ (opcional, para Score service)

### Instalação Automatizada (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/StellarCredit.git
cd StellarCredit

# 2. Execute o script de inicialização
./scripts/init.sh
```

**Pronto!** O script irá:
- ✅ Criar arquivo `.env` com configuração padrão
- ✅ Iniciar PostgreSQL (porta 5433) e Redis (porta 6379)
- ✅ Instalar todas as dependências do frontend
- ✅ Iniciar servidor de desenvolvimento Next.js
- ✅ Verificar se tudo está funcionando

**Acesse**: http://localhost:3000 (aguarde 30-60 segundos para compilação)

### Instalação Manual

Se preferir instalação passo a passo:

#### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/seu-usuario/StellarCredit.git
cd StellarCredit
```

#### 2️⃣ Configure Variáveis de Ambiente

```bash
cp .env.example .env
# Edite .env com suas configurações
```

**Variáveis principais:**
```env
# Stellar Network
STELLAR_NETWORK=testnet
HORIZON_URL=https://horizon-testnet.stellar.org

# Database (PostgreSQL na porta 5433)
DATABASE_URL=postgresql://stellar:stellar@localhost:5433/stellarcredit
REDIS_URL=redis://localhost:6379

# OpenAI (para ElisaOs AI)
OPENAI_API_KEY=sk-your-key-here
```

#### 3️⃣ Inicie a Infraestrutura

```bash
# Inicia PostgreSQL (porta 5433) e Redis (porta 6379)
docker-compose up -d
```

> **Nota**: PostgreSQL roda na porta **5433** (não 5432) para evitar conflitos com instalações locais.

#### 4️⃣ Instale e Inicie o Frontend

```bash
cd apps/web
npm install
npm run dev
```

**Acesse**: http://localhost:3000

#### Score Service (Rust)
```bash
cd services/score-service
cargo run --release
# Roda em http://localhost:8080
```

#### Risk Service (Python)
```bash
cd services/risk-service
pip install -r requirements.txt
python train_model.py  # Treina o modelo ML
uvicorn main:app --reload --port 8000
# Roda em http://localhost:8000
```

#### PIX Service (Node.js)
```bash
cd services/pix-service
npm install
npm start
# Roda em http://localhost:3001
```

#### ElisaOs AI (Python)
```bash
cd services/elisa-os
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
# Roda em http://localhost:8001
```

#### Ingestion Service (Python)
```bash
cd services/ingestion-service
pip install -r requirements.txt
python main.py
```

### 5️⃣ Rode o Frontend

```bash
cd apps/web
npm install
npm run dev
# Acesse http://localhost:3000
```

---

## 🔗 Smart Contracts Deployados

Todos os contratos estão **live na Stellar Testnet**:

### CreditScoreContract
```
CB7DFEI3BMVT6EL3SXDTASHKMAA57C2LCW4IYHMMX3CZREIMOSH3AROU
```
[Ver no Stellar Expert →](https://stellar.expert/explorer/testnet/contract/CB7DFEI3BMVT6EL3SXDTASHKMAA57C2LCW4IYHMMX3CZREIMOSH3AROU)

### SmartWallet Contract
```
CAM7ILOITXEQDL64AXUU5USONLSUQU35DRZYLLC65JFWSYZQLEG7I5K3
```
[Ver no Stellar Expert →](https://stellar.expert/explorer/testnet/contract/CAM7ILOITXEQDL64AXUU5USONLSUQU35DRZYLLC65JFWSYZQLEG7I5K3)

### LoanContract
```
CCQTVT7QKFG5YBDFZ76QDXDOHVFPWQKOGBHW65R5XNQEHWFZGDABYYWL
```
[Ver no Stellar Expert →](https://stellar.expert/explorer/testnet/contract/CCQTVT7QKFG5YBDFZ76QDXDOHVFPWQKOGBHW65R5XNQEHWFZGDABYYWL)

### GovernanceContract
```
CCYMG7GIUBGL6QW3YVD7UEB2NG26OJNSBCAE7N5TIJ6N55KJLDUNKIWL
```
[Ver no Stellar Expert →](https://stellar.expert/explorer/testnet/contract/CCYMG7GIUBGL6QW3YVD7UEB2NG26OJNSBCAE7N5TIJ6N55KJLDUNKIWL)

---

## 📊 Status do Projeto

### ✅ Fase 1-9: Pronto para Produção (100%)
- [x] Smart Contracts deployados na Testnet (4 contratos)
- [x] 5 microsserviços implementados e rodando
- [x] Frontend com integração completa de Wallet
- [x] Modelo ML real (XGBoost) para avaliação de risco
- [x] Data streaming (Kafka + Horizon)
- [x] Agente conversacional ElisaOs AI
- [x] Integração PIX (SEP-24)
- [x] GraphQL Federation (Apollo Gateway)
- [x] Manifestos de deployment Kubernetes
- [x] Stack de monitoramento (Prometheus, Grafana, Loki, Jaeger)
- [x] Preparação para auditoria de segurança
- [x] Documentação de compliance LGPD
- [x] Hardening de produção

### 🚀 Próximos Passos
- [ ] Auditoria de segurança externa (CertiK)
- [ ] Testes de penetração
- [ ] Programa de bug bounty
- [ ] Deploy na Mainnet (rollout faseado)
- [ ] App mobile (React Native)
- [ ] Suporte multi-chain
- [ ] Liquid staking
- [ ] Integração AMM
- [ ] Pools de seguro

---

## 🌍 Internacionalização

StellarCredit está disponível em:
- 🇺🇸 **Inglês** ([README.md](./README.md))
- 🇧🇷 **Português** (este arquivo)

Todo o texto voltado ao usuário foi traduzido. Veja [TRANSLATION_GUIDE.md](./docs/TRANSLATION_GUIDE.md) para detalhes.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">
  
  **Desenvolvido com ❤️ para democratizar o acesso ao crédito global**
  
  ⭐ Se este projeto foi útil, deixe uma estrela no GitHub!
  
  ![Stellar](https://img.shields.io/badge/Powered_by-Stellar-7D00FF?style=flat-square&logo=stellar)
  ![Soroban](https://img.shields.io/badge/Built_with-Soroban-00D1FF?style=flat-square)
  
</div>
