import { Schema } from 'mongoose';
import transactionSchema from './transactionSchema.js';

const envelopeSchema = new Schema({
    name: String,
    allocated: Schema.Types.Decimal128,
    expenses: [transactionSchema]
});

export default envelopeSchema;
