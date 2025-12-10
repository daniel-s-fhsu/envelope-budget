// Month model for API payloads. Keep in sync with backend month schema.
import { Envelope } from '../envelope/envelope-module';
import { Transaction } from '../transaction/transaction-module';

export interface Month {
  _id?: string;
  firebaseUserId: string;
  createdAt?: string;
  userId?: string;
  monthDigit: number;
  yearDigit: number;
  totalAvailable: number | string | { $numberDecimal: string };
  incomeTotal?: number;
  allocatedTotal?: number;
  incomes?: Transaction[];
  envelopes?: Envelope[];
}
