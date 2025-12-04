import { Router } from 'express';
import { getAllMonths, addMonth } from '../controllers/monthController.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const months = await getAllMonths();
        res.json(months);
    } catch (err) {
        console.error('Error fetching months', err);
        res.status(500).json({ message: 'Failed to fetch months' });
    }
});

router.post('/', async (req, res) => {
    try {
        const saved = await addMonth(req.body);
        res.status(201).json(saved);
    } catch (err) {
        console.error('Error saving month', err);
        res.status(500).json({ message: 'Failed to save month' });
    }
});

export default router;
