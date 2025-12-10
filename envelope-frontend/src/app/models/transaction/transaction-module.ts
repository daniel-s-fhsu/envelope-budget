// Transaction model for API payloads. Keep in sync with backend transaction schema.
export interface Transaction {
  _id?: string;
  firebaseUserId: string;
  createdAt?: string;
  monthId?: string;
  envelopeId?: string;
  name: string;
  description?: string;
  amount: number | string | { $numberDecimal: string };
}
