import mongoose from 'mongoose';
import monthSchema from '../models/schemas/monthSchema.js';

export async function getAllMonths() {
    const Month = mongoose.models.Month || mongoose.model('Month', monthSchema);
    return Month.find();
}

export async function addMonth(monthJson) {
    const Month = mongoose.models.Month || mongoose.model('Month', monthSchema);
    const saveMonth = new Month(monthJson);
    return saveMonth.save();
}
