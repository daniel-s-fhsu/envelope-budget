import { Schema } from 'mongoose';
import transactionSchema from './transactionSchema';

const envelopeSchema = new Schema({
    name: String,
    allocated: Schema.Types.Decimal128,
    expenses: [transactionSchema]
});

export default envelopeSchema;
