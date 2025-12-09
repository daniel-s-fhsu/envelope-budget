import { Router } from 'express';
import { getAllMonths, addMonth, updateMonth, deleteMonth } from '../controllers/monthController.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const months = await getAllMonths(firebaseUid);
        res.json(months);
    } catch (err) {
        console.error('Error fetching months', err);
        res.status(500).json({ message: 'Failed to fetch months' });
    }
});

router.post('/', async (req, res) => {
    try {
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const payload = { ...req.body, firebaseUserId: firebaseUid };
        const saved = await addMonth(payload);
        res.status(201).json(saved);
    } catch (err) {
        console.error('Error saving month', err);
        if (err.statusCode === 409) {
            res.status(409).json({ message: 'Month already exists' });
        } else {
            res.status(500).json({ message: 'Failed to save month' });
        }
    }
});

router.put('/:id', async (req, res) => {
    try {
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const updated = await updateMonth(firebaseUid, req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Month not found' });
        }
        res.json(updated);
    } catch (err) {
        console.error('Error updating month', err);
        res.status(500).json({ message: 'Failed to update month' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const removed = await deleteMonth(firebaseUid, req.params.id);
        if (!removed) {
            return res.status(404).json({ message: 'Month not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting month', err);
        res.status(500).json({ message: 'Failed to delete month' });
    }
});

export default router;
