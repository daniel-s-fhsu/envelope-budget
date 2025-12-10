import mongoose from 'mongoose';
import transactionSchema from '../models/schemas/transactionSchema.js';
import monthSchema from '../models/schemas/monthSchema.js';
import envelopeSchema from '../models/schemas/envelopeSchema.js';

function getTransactionModel() {
  return mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
}

function getMonthModel() {
  return mongoose.models.Month || mongoose.model('Month', monthSchema);
}

function getEnvelopeModel() {
  return mongoose.models.Envelope || mongoose.model('Envelope', envelopeSchema);
}

function toNumberAmount(val) {
  if (val == null) return 0;
  const raw = val.$numberDecimal ?? val;
  const num = Number(raw);
  return isNaN(num) ? 0 : num;
}

export async function recalcMonthTotals(firebaseUserId, monthId) {
  // Recalculate month/envelope totals for CRUD operations
  if (!monthId) return;
  const Transaction = getTransactionModel();
  const Month = getMonthModel();
  const Envelope = getEnvelopeModel();

  //Get these as lean objects since they don't need to be full mongo documents for calcs
  const incomes = await Transaction.find({
    firebaseUserId,
    monthId,
    envelopeId: { $exists: false }
  }).lean();
  const envelopes = await Envelope.find({
    firebaseUserId,
    monthId
  }).lean();
  // js calcs, reduce array to sums
  const incomeTotal = incomes.reduce((sum, tx) => sum + toNumberAmount(tx.amount), 0);
  const allocatedTotal = envelopes.reduce((sum, env) => sum + toNumberAmount(env.allocated), 0);
  const remaining = incomeTotal - allocatedTotal;

  // updates the set of values under month
  await Month.updateOne(
    { _id: monthId, firebaseUserId },
    {
      $set: {
        incomes,
        incomeTotal,
        allocatedTotal,
        totalAvailable: mongoose.Types.Decimal128.fromString(remaining.toFixed(2))
      }
    }
  );
}

export async function getAllTransactions(firebaseUserId, monthId, envelopeId) {
  const Transaction = getTransactionModel();
  const filter = { firebaseUserId };
  if (monthId) {
    filter.monthId = monthId;
  }
  if (envelopeId) {
    filter.envelopeId = envelopeId;
  } else {
    return [];
  }
  return Transaction.find(filter);
}

export async function addTransaction(txJson) {
  const Transaction = getTransactionModel();
  const doc = new Transaction(txJson);
  const saved = await doc.save();
  if (saved.monthId) {
    await recalcMonthTotals(saved.firebaseUserId, saved.monthId);
  }
  return saved;
}

export async function updateTransaction(firebaseUserId, transactionId, updates) {
  const Transaction = getTransactionModel();

  // get the new updated tx for return
  const updated = await Transaction.findOneAndUpdate(
    { _id: transactionId, firebaseUserId },
    { $set: updates },
    { new: true }
  );
  if (updated && updated.monthId) {
    await recalcMonthTotals(firebaseUserId, updated.monthId);
  }
  return updated;
}

export async function deleteTransaction(firebaseUserId, transactionId) {
  const Transaction = getTransactionModel();
  const removed = await Transaction.findOneAndDelete({ _id: transactionId, firebaseUserId });
  if (removed && removed.monthId) {
    await recalcMonthTotals(firebaseUserId, removed.monthId);
  }
  return removed;
}
