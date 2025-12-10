import mongoose from 'mongoose';
import monthSchema from '../models/schemas/monthSchema.js';
import envelopeSchema from '../models/schemas/envelopeSchema.js';
import transactionSchema from '../models/schemas/transactionSchema.js';
import { Decimal128 } from 'bson';

function getMonthModel() {
    return mongoose.models.Month || mongoose.model('Month', monthSchema);
}

function getEnvelopeModel() {
    return mongoose.models.Envelope || mongoose.model('Envelope', envelopeSchema);
}

function getTransactionModel() {
    return mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
}

export async function getAllMonths(firebaseUserId) {
    const Month = getMonthModel();
    return Month.find({ firebaseUserId });
}

export async function addMonth(monthJson) {
    //add a month
    const Month = getMonthModel();
    const exists = await Month.findOne({
        firebaseUserId: monthJson.firebaseUserId,
        monthDigit: monthJson.monthDigit,
        yearDigit: monthJson.yearDigit
    });
    //check for dupes
    if (exists) {
        const err = new Error('Month already exists for this user');
        err.statusCode = 409;
        throw err;
    }
    const saveMonth = new Month(monthJson);
    return saveMonth.save();
}

export async function updateMonth(firebaseUserId, monthId, updates) {
    // update month
    const Month = getMonthModel();
    const updateDoc = { ...updates };
    // update totals if incomes are updated
    if (updates.incomes && Array.isArray(updates.incomes)) {
        const total = updates.incomes.reduce((sum, tx) => {
            // had an issue with mongo.decimal128, this either uses the string or the number, and verifies that it is a number
            // before calculations
            const amt = tx.amount?.$numberDecimal ?? tx.amount ?? 0;
            const num = Number(amt);
            return sum + (isNaN(num) ? 0 : num);
        }, 0);
        updateDoc.totalAvailable = Decimal128.fromString(total.toFixed(2));
    }
    const updated = await Month.findOneAndUpdate(
        { _id: monthId, firebaseUserId },
        { $set: updateDoc },
        { new: true }
    );
    return updated;
}

export async function deleteMonth(firebaseUserId, monthId) {
    const Month = getMonthModel();
    const Envelope = getEnvelopeModel();
    const Transaction = getTransactionModel();
    const removed = await Month.findOneAndDelete({ _id: monthId, firebaseUserId });
    if (removed) {
        await Envelope.deleteMany({ firebaseUserId, monthId });
        await Transaction.deleteMany({ firebaseUserId, monthId });
    }
    return removed;
}
