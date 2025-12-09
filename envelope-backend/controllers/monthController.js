import mongoose from 'mongoose';
import monthSchema from '../models/schemas/monthSchema.js';

export async function getAllMonths(firebaseUserId) {
    const Month = mongoose.models.Month || mongoose.model('Month', monthSchema);
    return Month.find({ firebaseUserId });
}

export async function addMonth(monthJson) {
    const Month = mongoose.models.Month || mongoose.model('Month', monthSchema);
    const exists = await Month.findOne({
        firebaseUserId: monthJson.firebaseUserId,
        monthDigit: monthJson.monthDigit,
        yearDigit: monthJson.yearDigit
    });
    if (exists) {
        const err = new Error('Month already exists for this user');
        err.statusCode = 409;
        throw err;
    }
    const saveMonth = new Month(monthJson);
    return saveMonth.save();
}

export async function updateMonth(firebaseUserId, monthId, updates) {
    const Month = mongoose.models.Month || mongoose.model('Month', monthSchema);
    const updated = await Month.findOneAndUpdate(
        { _id: monthId, firebaseUserId },
        { $set: updates },
        { new: true }
    );
    return updated;
}

export async function deleteMonth(firebaseUserId, monthId) {
    const Month = mongoose.models.Month || mongoose.model('Month', monthSchema);
    return Month.findOneAndDelete({ _id: monthId, firebaseUserId });
}
