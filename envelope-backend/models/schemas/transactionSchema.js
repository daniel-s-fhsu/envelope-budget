import { Schema } from 'mongoose';

const transactionSchema = new Schema({
    name: String,
    description: String,
    amount: Schema.Types.Decimal128,
});

export default transactionSchema;
