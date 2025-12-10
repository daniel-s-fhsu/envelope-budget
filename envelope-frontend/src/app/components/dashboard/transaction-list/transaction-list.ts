import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Transaction } from '../../../models/transaction/transaction-module';
import { getIdTokenForAuth } from '../../../services/firebase-implementation';
import { environment } from '../../../../environments/environment';
import { TransactionForm } from '../transaction-form/transaction-form';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, TransactionForm],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionList implements OnChanges {
  @Input() monthId: string | null = null;
  @Input() envelopeId: string | null = null;
  @Output() transactionsChanged = new EventEmitter<void>();
  showForm = false;

  transactions: Transaction[] = [];
  loading = false;
  error: string | null = null;

  constructor(private readonly http: HttpClient, private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthId'] || changes['envelopeId']) {
      this.loadTransactions();
    }
  }

  async loadTransactions() {
    this.transactions = [];
    if (!this.monthId || !this.envelopeId) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      const token = await getIdTokenForAuth();
      if (!token) throw new Error('Not authenticated');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      const data = await firstValueFrom(
        this.http.get<Transaction[]>(`${environment.backendURL}/transactions`, {
          headers,
          params: { monthId: this.monthId, envelopeId: this.envelopeId }
        })
      );
      this.transactions = data.filter(tx => tx.envelopeId === this.envelopeId);
    } catch (err) {
      console.error('Failed to load transactions', err);
      this.error = 'Failed to load transactions';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  formatAmount(val: Transaction['amount']): string {
    if (val == null) return '$0.00';
    if (typeof val === 'number') return `$${val.toFixed(2)}`;

    // string check
    if (typeof val === 'string') {
      const num = Number(val);
      return isNaN(num) ? val : `$${num.toFixed(2)}`;
    }

    //dec check
    const dec = (val as any).$numberDecimal;
    if (dec !== undefined) {
      const num = Number(dec);
      return isNaN(num) ? `$${dec}` : `$${num.toFixed(2)}`;
    }
    return `$${val}`;
  }

  async onTransactionAdded(tx: Transaction) {
    // reload to ensure remaining/allocated refresh elsewhere
    await this.loadTransactions();
    this.transactionsChanged.emit();
    this.showForm = false;
    this.cdr.detectChanges();
  }
}
