import { Router } from 'express';
import {
  addTransaction,
  deleteTransaction,
  getAllTransactions,
  updateTransaction
} from '../controllers/transactionController.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ message: 'Unauthorized' });
    const { monthId, envelopeId } = req.query;
    const txs = await getAllTransactions(firebaseUid, monthId, envelopeId);
    res.json(txs);
  } catch (err) {
    console.error('Error fetching transactions', err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

router.post('/', async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ message: 'Unauthorized' });
    const payload = { ...req.body, firebaseUserId: firebaseUid };
    const saved = await addTransaction(payload);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving transaction', err);
    res.status(500).json({ message: 'Failed to save transaction' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ message: 'Unauthorized' });
    const updated = await updateTransaction(firebaseUid, req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Transaction not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating transaction', err);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ message: 'Unauthorized' });
    const removed = await deleteTransaction(firebaseUid, req.params.id);
    if (!removed) return res.status(404).json({ message: 'Transaction not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting transaction', err);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
});

export default router;
