import { Schema, Types } from 'mongoose';
import envelopeSchema from './envelopeSchema.js';
import transactionSchema from './transactionSchema.js';

const monthSchema = new Schema({
    firebaseUserId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    userId: Types.ObjectId,  // adjust if user IDs are not Mongo ObjectIds
    monthDigit: Number,
    yearDigit: Number,
    totalAvailable: { type: Schema.Types.Decimal128, default: () => new Types.Decimal128('0') },
    incomeTotal: { type: Schema.Types.Decimal128, default: () => new Types.Decimal128('0') },
    allocatedTotal: { type: Schema.Types.Decimal128, default: () => new Types.Decimal128('0') },
    incomes: [transactionSchema],  // can have multiple incomes per month
    envelopes: [envelopeSchema]
});

// Ensure a user cannot have duplicate month/year combinations
monthSchema.index({ firebaseUserId: 1, monthDigit: 1, yearDigit: 1 }, { unique: true });

export default monthSchema;
