// Envelope model for API payloads. Keep in sync with backend envelope schema.
import { Transaction } from '../transaction/transaction-module';

export interface Envelope {
  _id?: string;
  firebaseUserId: string;
  createdAt?: string;
  monthId?: string;
  name: string;
  allocated: number | string | { $numberDecimal: string };
  remaining?: number;
  expenses?: Transaction[];
}
