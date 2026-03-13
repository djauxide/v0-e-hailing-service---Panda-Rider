import { Router, Request, Response } from 'express';
import { walletService } from '../services/wallet.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ApiError, ErrorCodes } from '../utils/errors';

const router = Router();

// Get wallet details
router.get('/', authenticate(), async (req: AuthRequest, res: Response) => {
  try {
    const wallet = await walletService.getWallet(req.user!.uid);
    
    if (!wallet) {
      // Create wallet if doesn't exist
      const newWallet = await walletService.createWallet(req.user!.uid);
      return res.json({ success: true, data: newWallet });
    }

    res.json({ success: true, data: wallet });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction history
router.get('/transactions', authenticate(), async (req: AuthRequest, res: Response) => {
  try {
    const { limit = '20', startAfter } = req.query;
    const transactions = await walletService.getTransactions(
      req.user!.uid,
      parseInt(limit as string),
      startAfter as string
    );

    res.json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Top up wallet
router.post('/topup', authenticate(), async (req: AuthRequest, res: Response) => {
  try {
    const { amount, paymentMethodId } = req.body;

    if (!amount || !paymentMethodId) {
      throw new ApiError(ErrorCodes.INVALID_INPUT, 'Amount and payment method required');
    }

    const result = await walletService.topUp(req.user!.uid, amount, paymentMethodId);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: result.transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send money to another user
router.post('/send', authenticate(), async (req: AuthRequest, res: Response) => {
  try {
    const { recipientPhone, amount, note } = req.body;

    if (!recipientPhone || !amount) {
      throw new ApiError(ErrorCodes.INVALID_INPUT, 'Recipient phone and amount required');
    }

    const result = await walletService.sendMoney(
      req.user!.uid,
      recipientPhone,
      amount,
      note
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: result.transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Request money from another user
router.post('/request', authenticate(), async (req: AuthRequest, res: Response) => {
  try {
    const { fromPhone, amount, note } = req.body;

    if (!fromPhone || !amount) {
      throw new ApiError(ErrorCodes.INVALID_INPUT, 'Phone number and amount required');
    }

    const result = await walletService.requestMoney(
      req.user!.uid,
      fromPhone,
      amount,
      note
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: { requestId: result.requestId } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Withdraw to bank
router.post('/withdraw', authenticate(), async (req: AuthRequest, res: Response) => {
  try {
    const { amount, bankAccountId } = req.body;

    if (!amount || !bankAccountId) {
      throw new ApiError(ErrorCodes.INVALID_INPUT, 'Amount and bank account required');
    }

    const result = await walletService.withdraw(req.user!.uid, amount, bankAccountId);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: result.transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Link bank account
router.post('/link-bank', authenticate(), async (req: AuthRequest, res: Response) => {
  try {
    const { bankName, accountNumber, branchCode } = req.body;

    if (!bankName || !accountNumber || !branchCode) {
      throw new ApiError(ErrorCodes.INVALID_INPUT, 'Bank details required');
    }

    const result = await walletService.linkBankAccount(
      req.user!.uid,
      bankName,
      accountNumber,
      branchCode
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: 'Bank account linked successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pay for trip from wallet
router.post('/pay-trip', authenticate(), async (req: AuthRequest, res: Response) => {
  try {
    const { tripId, amount } = req.body;

    if (!tripId || !amount) {
      throw new ApiError(ErrorCodes.INVALID_INPUT, 'Trip ID and amount required');
    }

    const result = await walletService.payForTrip(req.user!.uid, tripId, amount);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: result.transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
