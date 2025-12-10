import { Schema } from 'mongoose';
import transactionSchema from './transactionSchema.js';

const envelopeSchema = new Schema({
    firebaseUserId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    monthId: { type: String },
    name: String,
    allocated: Schema.Types.Decimal128,
    expenses: [transactionSchema]
});

export default envelopeSchema;
