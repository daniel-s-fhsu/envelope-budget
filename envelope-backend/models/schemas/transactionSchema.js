import { Schema } from 'mongoose';

const transactionSchema = new Schema({
    firebaseUserId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    monthId: { type: String },
    envelopeId: { type: String },
    name: String,
    description: String,
    amount: Schema.Types.Decimal128,
});

export default transactionSchema;
