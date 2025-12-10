import { Router } from 'express';
import {
  addEnvelope,
  deleteEnvelope,
  getAllEnvelopes,
  getEnvelopeById,
  updateEnvelope
} from '../controllers/envelopeController.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ message: 'Unauthorized' });
    const { monthId } = req.query;
    const envelopes = await getAllEnvelopes(firebaseUid, monthId);
    res.json(envelopes);
  } catch (err) {
    console.error('Error fetching envelopes', err);
    res.status(500).json({ message: 'Failed to fetch envelopes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ message: 'Unauthorized' });
    const envelope = await getEnvelopeById(firebaseUid, req.params.id);
    if (!envelope) return res.status(404).json({ message: 'Envelope not found' });
    res.json(envelope);
  } catch (err) {
    console.error('Error fetching envelope', err);
    res.status(500).json({ message: 'Failed to fetch envelope' });
  }
});

router.post('/', async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ message: 'Unauthorized' });
    const payload = { ...req.body, firebaseUserId: firebaseUid };
    const saved = await addEnvelope(payload);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving envelope', err);
    res.status(500).json({ message: 'Failed to save envelope' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ message: 'Unauthorized' });
    const updated = await updateEnvelope(firebaseUid, req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Envelope not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating envelope', err);
    res.status(500).json({ message: 'Failed to update envelope' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ message: 'Unauthorized' });
    const removed = await deleteEnvelope(firebaseUid, req.params.id);
    if (!removed) return res.status(404).json({ message: 'Envelope not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting envelope', err);
    res.status(500).json({ message: 'Failed to delete envelope' });
  }
});

export default router;
