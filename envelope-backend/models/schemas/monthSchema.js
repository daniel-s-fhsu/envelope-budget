import { Schema, Types } from 'mongoose';
import envelopeSchema from './envelopeSchema.js';
import transactionSchema from './transactionSchema.js';

const monthSchema = new Schema({
    userId: Types.ObjectId,  // adjust if user IDs are not Mongo ObjectIds
    monthDigit: Number,
    yearDigit: Number,
    totalAvailable: Schema.Types.Decimal128,
    incomes: [transactionSchema],  // can have multiple incomes per month
    envelopes: [envelopeSchema]
});

export default monthSchema;
