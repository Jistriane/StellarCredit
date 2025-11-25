// PIX Service with Stellar Anchor SDK Integration
import express from 'express';
import { Anchor, Config, Sep24, Sep31 } from '@stellar/anchor-sdk';
import { Keypair, Networks, Server, TransactionBuilder, Operation, Asset } from 'stellar-sdk';
import axios from 'axios';

const app = express();
app.use(express.json());

// Anchor SDK Configuration
const anchorConfig: Config = {
  network: process.env.STELLAR_NETWORK || Networks.TESTNET,
  horizonUrl: process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org',
  assetCode: 'BRLT',
  assetIssuer: process.env.BRLT_ISSUER || '',
  homeDomain: 'stellarcredit.io',
};

// Initialize Anchor
const anchor = new Anchor(anchorConfig);

// SEP-24: Interactive Deposit/Withdrawal
class PIXAnchorService {
  private server: Server;
  private issuerKeypair: Keypair;
  private brlAsset: Asset;

  constructor() {
    this.server = new Server(anchorConfig.horizonUrl);
    this.issuerKeypair = Keypair.fromSecret(process.env.BRLT_ISSUER_SECRET || '');
    this.brlAsset = new Asset(anchorConfig.assetCode, anchorConfig.assetIssuer);
  }

  // SEP-24: Initiate Interactive Deposit
  async initiateDeposit(req: express.Request, res: express.Response) {
    const { account, amount } = req.body;

    try {
      // 1. Validate PIX limits (R$ 5,000 for individuals)
      if (amount > 5000) {
        return res.status(400).json({ error: 'Amount exceeds daily limit' });
      }

      // 2. Generate PIX payment (Banco Central API simulation)
      const pixPayment = await this.generatePIXPayment(amount);

      // 3. Create deposit transaction
      const deposit = {
        id: `dep_${Date.now()}`,
        account,
        asset: `${this.brlAsset.code}:${this.brlAsset.issuer}`,
        amount: amount.toString(),
        status: 'pending_user_transfer_start',
        instructions: {
          pix_key: pixPayment.pixKey,
          qr_code: pixPayment.qrCode,
          qr_code_image: pixPayment.qrCodeImage,
          expiration: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
      };

      // 4. Store in database (placeholder)
      // await db.deposits.insert(deposit);

      // 5. Setup webhook listener
      this.setupPIXWebhook(deposit.id, account, amount);

      res.json(deposit);
    } catch (error) {
      console.error('Deposit error:', error);
      res.status(500).json({ error: 'Failed to initiate deposit' });
    }
  }

  // Generate PIX payment via Banco Central DICT API
  private async generatePIXPayment(amount: number) {
    // In production, integrate with:
    // - Banco Central DICT API (https://www.bcb.gov.br/estabilidadefinanceira/pix)
    // - PSP (Payment Service Provider) certified API
    
    const pixKey = process.env.PIX_KEY || 'stellarcredit@example.com';
    
    // Mock PIX generation
    const payload = {
      version: '01',
      key: pixKey,
      merchantName: 'StellarCredit',
      merchantCity: 'SAO_PAULO',
      amount: amount.toFixed(2),
      txId: `SC${Date.now()}`,
    };

    // Generate EMV QR Code (Pix Copia e Cola)
    const qrCode = this.generateEMVQRCode(payload);
    
    // Generate QR Code Image URL
    const qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`;

    return {
      pixKey,
      qrCode,
      qrCodeImage,
      txId: payload.txId,
    };
  }

  // Generate EMV QR Code for PIX
  private generateEMVQRCode(payload: any): string {
    // Simplified EMV QR Code generation
    // In production, use proper EMV QR Code library
    return `00020126580014br.gov.bcb.pix0136${payload.key}520400005303986${payload.amount}5802BR5913${payload.merchantName}6009${payload.merchantCity}62070503***6304`;
  }

  // Setup PIX webhook listener
  private setupPIXWebhook(depositId: string, account: string, amount: number) {
    // Simulate PIX confirmation after 30 seconds (for demo)
    setTimeout(async () => {
      await this.processPIXConfirmation(depositId, account, amount);
    }, 30000);
  }

  // Process PIX payment confirmation
  private async processPIXConfirmation(depositId: string, account: string, amount: number) {
    try {
      // 1. Mint BRLT tokens to user account
      const sourceAccount = await this.server.loadAccount(this.issuerKeypair.publicKey());
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.payment({
          destination: account,
          asset: this.brlAsset,
          amount: amount.toString(),
        }))
        .setTimeout(30)
        .build();

      transaction.sign(this.issuerKeypair);
      
      const result = await this.server.submitTransaction(transaction);
      
      console.log(`Deposit ${depositId} completed. Tx: ${result.hash}`);
      
      // 2. Update deposit status
      // await db.deposits.update(depositId, { status: 'completed', tx_hash: result.hash });

    } catch (error) {
      console.error('PIX confirmation error:', error);
    }
  }

  // SEP-24: Initiate Interactive Withdrawal
  async initiateWithdrawal(req: express.Request, res: express.Response) {
    const { account, amount, pix_key } = req.body;

    try {
      // 1. Validate PIX key
      const isValid = await this.validatePIXKey(pix_key);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid PIX key' });
      }

      // 2. Create withdrawal (user must burn BRLT tokens)
      const withdrawal = {
        id: `with_${Date.now()}`,
        account,
        asset: `${this.brlAsset.code}:${this.brlAsset.issuer}`,
        amount: amount.toString(),
        status: 'pending_anchor',
        destination: pix_key,
      };

      // 3. Wait for user to send BRLT to anchor
      // (In production, listen for Stellar transaction)

      // 4. Execute PIX transfer
      setTimeout(async () => {
        await this.executePIXTransfer(withdrawal.id, pix_key, amount);
      }, 10000);

      res.json(withdrawal);
    } catch (error) {
      console.error('Withdrawal error:', error);
      res.status(500).json({ error: 'Failed to initiate withdrawal' });
    }
  }

  // Validate PIX key via Banco Central DICT
  private async validatePIXKey(pixKey: string): Promise<boolean> {
    // In production, query DICT API
    // Types: CPF, CNPJ, Email, Phone, Random (EVP)
    
    // Mock validation
    const pixKeyRegex = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^\+55\d{11}$/,
      cpf: /^\d{11}$/,
      cnpj: /^\d{14}$/,
      random: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
    };

    return Object.values(pixKeyRegex).some(regex => regex.test(pixKey));
  }

  // Execute PIX transfer via PSP
  private async executePIXTransfer(withdrawalId: string, pixKey: string, amount: number) {
    try {
      // In production, call PSP API (e.g., Itaú, Bradesco, Banco do Brasil)
      // POST /pix/transfers
      
      console.log(`Executing PIX transfer: ${amount} BRL to ${pixKey}`);
      
      // Mock transfer
      const transfer = {
        id: `tx_${Date.now()}`,
        destination: pixKey,
        amount,
        status: 'completed',
      };

      console.log(`Withdrawal ${withdrawalId} completed. PIX: ${transfer.id}`);
      
    } catch (error) {
      console.error('PIX transfer error:', error);
    }
  }
}

// Initialize service
const pixService = new PIXAnchorService();

// Routes
app.post('/api/v1/sep24/deposit', (req, res) => pixService.initiateDeposit(req, res));
app.post('/api/v1/sep24/withdraw', (req, res) => pixService.initiateWithdrawal(req, res));

// SEP-24 Info endpoint
app.get('/api/v1/sep24/info', (req, res) => {
  res.json({
    deposit: {
      'BRLT': {
        enabled: true,
        authentication_required: true,
        min_amount: 10,
        max_amount: 5000,
        fee_fixed: 0,
        fee_percent: 0.01,
      },
    },
    withdraw: {
      'BRLT': {
        enabled: true,
        authentication_required: true,
        min_amount: 10,
        max_amount: 5000,
        fee_fixed: 0,
        fee_percent: 0.01,
      },
    },
  });
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy', service: 'pix-anchor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`PIX Anchor Service running on port ${PORT}`);
});

export default app;
