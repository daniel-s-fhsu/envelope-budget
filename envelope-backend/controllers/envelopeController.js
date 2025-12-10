import envelopeSchema from '../models/schemas/envelopeSchema.js';
import monthSchema from '../models/schemas/monthSchema.js';
import transactionSchema from '../models/schemas/transactionSchema.js';
import { recalcMonthTotals } from './transactionController.js';

function getEnvelopeModel() {
  return mongoose.models.Envelope || mongoose.model('Envelope', envelopeSchema);
}

function getMonthModel() {
  return mongoose.models.Month || mongoose.model('Month', monthSchema);
}

function getTransactionModel() {
  return mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
}

function toNumberAmount(val) {
  //sanity check that given value is a number
  if (val == null) return 0;
  const raw = val.$numberDecimal ?? val;
  const num = Number(raw);
  return isNaN(num) ? 0 : num;
}

export async function getAllEnvelopes(firebaseUserId, monthId) {
  // in this case, get all envelopes is tied to the given user and the selected month.  There is no
  //need to retreive everything.
  const Envelope = getEnvelopeModel();
  const filter = { firebaseUserId };
  if (monthId) {
    filter.monthId = monthId;
  }
  const envelopes = await Envelope.find(filter);

  //return if nothing found
  if (!envelopes.length) return envelopes;

  //start gathering transactions
  const Transaction = getTransactionModel();

  //"enrich" the envelopes synchronously by calculating total spent, total remaining, return as obj ready for json
  const enriched = await Promise.all(
    envelopes.map(async env => {
      const spentTx = await Transaction.find({
        firebaseUserId,
        envelopeId: env._id?.toString()
      }).lean();
      const spent = spentTx.reduce((sum, tx) => sum + toNumberAmount(tx.amount), 0);
      const allocatedNum = toNumberAmount(env.allocated);
      const remaining = allocatedNum - spent;
      const obj = env.toObject();
      obj.remaining = remaining;
      obj.allocatedNumber = allocatedNum;
      return obj;
    })
  );
  return enriched;
}

export async function getEnvelopeById(firebaseUserId, envelopeId) {
  //get single envelope by string id
  const Envelope = getEnvelopeModel();
  return Envelope.findOne({ _id: envelopeId, firebaseUserId });
}

export async function addEnvelope(envelopeJson) {
  //add envelope
  const Envelope = getEnvelopeModel();
  const doc = new Envelope({
    ...envelopeJson
  });
  const saved = await doc.save();
  //save update to month envelope is in as well
  if (saved.monthId) {
    const Month = getMonthModel();
    await Month.updateOne(
      { _id: saved.monthId, firebaseUserId: saved.firebaseUserId },
      { $push: { envelopes: saved.toObject() } }
    );
    await recalcMonthTotals(saved.firebaseUserId, saved.monthId);
  }
  return saved;
}

export async function updateEnvelope(firebaseUserId, envelopeId, updates) {
  //update envelope as well
  const Envelope = getEnvelopeModel();
  const updated = await Envelope.findOneAndUpdate(
    { _id: envelopeId, firebaseUserId },
    { $set: updates },
    { new: true }
  );
  // month shouldn't update, but just in case...
  if (updated?.monthId) {
    await recalcMonthTotals(firebaseUserId, updated.monthId);
  }
  return updated;
}

export async function deleteEnvelope(firebaseUserId, envelopeId) {
  //delete envelope
  const Envelope = getEnvelopeModel();
  const removed = await Envelope.findOneAndDelete({ _id: envelopeId, firebaseUserId });
  //update month array, incase mongo doesn't do it
  if (removed?.monthId) {
    const Month = getMonthModel();
    await Month.updateOne(
      { _id: removed.monthId, firebaseUserId },
      { $pull: { envelopes: { _id: removed._id } } }
    );
    await recalcMonthTotals(firebaseUserId, removed.monthId);
  }
  return removed;
}
