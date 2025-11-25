require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Keypair } = require('stellar-sdk');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

// Mock Database
const deposits = new Map();
const withdrawals = new Map();

// SEP-24 / SEP-31 Mock Endpoints

// 1. Deposit (SEP-24)
app.post('/api/v1/pix/deposit', (req, res) => {
    const { account, amount } = req.body;
    
    if (!account || !amount) {
        return res.status(400).json({ error: 'Missing account or amount' });
    }

    const id = `dep_${Date.now()}`;
    const pixKey = `pix-key-${id}`;
    const qrCode = `mock-qr-code-data-${id}`;

    const deposit = {
        id,
        account,
        amount,
        status: 'pending_user_transfer_start',
        pix_key: pixKey,
        qr_code: qrCode,
        created_at: new Date().toISOString()
    };

    deposits.set(id, deposit);

    res.json({
        id,
        instructions: {
            pix_key: pixKey,
            qr_code: qrCode
        }
    });
});

// 2. Withdrawal (SEP-24)
app.post('/api/v1/pix/withdraw', (req, res) => {
    const { account, amount, pix_key } = req.body;

    if (!account || !amount || !pix_key) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    const id = `wdr_${Date.now()}`;
    
    const withdrawal = {
        id,
        account,
        amount,
        pix_key,
        status: 'pending_user_transfer_start', // Waiting for user to send tokens
        memo: id, // Memo to use for transaction
        memo_type: 'text',
        receiving_account: process.env.ANCHOR_ACCOUNT || 'G...', 
        created_at: new Date().toISOString()
    };

    withdrawals.set(id, withdrawal);

    res.json(withdrawal);
});

// 3. Webhook for PIX Payment (Mock)
app.post('/api/v1/pix/webhook', (req, res) => {
    const { id, status } = req.body;
    
    if (deposits.has(id)) {
        const deposit = deposits.get(id);
        deposit.status = status; // e.g., 'completed'
        // Trigger Stellar transfer logic here (mocked)
        console.log(`Deposit ${id} updated to ${status}`);
        return res.json({ status: 'ok' });
    }
    
    if (withdrawals.has(id)) {
        const withdrawal = withdrawals.get(id);
        withdrawal.status = status;
        console.log(`Withdrawal ${id} updated to ${status}`);
        return res.json({ status: 'ok' });
    }

    res.status(404).json({ error: 'Transaction not found' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`PIX Service running on port ${PORT}`);
});
