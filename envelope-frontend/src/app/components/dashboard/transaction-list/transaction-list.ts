import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Transaction } from '../../../models/transaction/transaction-module';
import { getIdTokenForAuth } from '../../../services/firebase-implementation';
import { environment } from '../../../../environments/environment';
import { TransactionForm } from '../transaction-form/transaction-form';
import { TransactionEdit } from './transaction-edit/transaction-edit';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, TransactionForm, TransactionEdit],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionList implements OnChanges {
  @Input() monthId: string | null = null;
  @Input() envelopeId: string | null = null;
  @Output() transactionsChanged = new EventEmitter<void>();
  showForm = false;
  showEdit = false;
  selectedTransactionId: string | null = null;

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
    this.selectedTransactionId = null;

    if (!this.monthId || !this.envelopeId) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      // auth stuff
      const token = await getIdTokenForAuth();
      if (!token) throw new Error('Not authenticated');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      const data = await firstValueFrom(
        this.http.get<Transaction[]>(`${environment.backendURL}/transactions`, {
          headers,
          params: { monthId: this.monthId, envelopeId: this.envelopeId }
        })
      );

      //just the envelope selected, please
      this.transactions = data.filter(tx => tx.envelopeId === this.envelopeId);
      this.selectedTransactionId = this.transactions[0]?._id ?? null;
    } catch (err) {
      console.error('Failed to load transactions', err);
      this.error = 'Failed to load transactions';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  formatAmount(val: Transaction['amount']): string {
    const num = this.toNumber(val);
    return this.toCurrency(num);
  }

  async onTransactionAdded(tx: Transaction) {
    // Optimistically update list to avoid blanking while other panels refresh
    this.transactions = [tx, ...this.transactions];
    this.selectedTransactionId = tx._id ?? this.selectedTransactionId;
    this.transactionsChanged.emit();
    this.showForm = false;
    this.showEdit = false;
    this.cdr.detectChanges();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.showEdit = false;
    }
  }

  toggleEdit() {
    this.showEdit = !this.showEdit;
    if (this.showEdit) {
      this.showForm = false;
    }
  }

  onSelect(id: string) {
    this.selectedTransactionId = id;
    this.showEdit = false;
    this.cdr.detectChanges();
  }

  get selectedTransaction(): Transaction | undefined {
    return this.transactions.find(t => t._id === this.selectedTransactionId);
  }

  async onTransactionEdited(update: { name: string; description: string; amount: number }) {
    if (!this.selectedTransactionId) return;
    try {
      const token = await getIdTokenForAuth();
      if (!token) throw new Error('Not authenticated');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      // put an update
      await firstValueFrom(
        this.http.put<Transaction>(
          `${environment.backendURL}/transactions/${this.selectedTransactionId}`,
          update,
          { headers }
        )
      );

      // load the update
      await this.loadTransactions();
      this.transactionsChanged.emit();
      this.showEdit = false;
    } catch (err) {
      console.error('Failed to update transaction', err);
      this.error = 'Failed to update transaction';
    } finally {
      // display updates
      this.cdr.detectChanges();
    }
  }

  async onTransactionDeleted() {
    if (!this.selectedTransactionId) return;
    
    try {
      const token = await getIdTokenForAuth();
      if (!token) throw new Error('Not authenticated');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      await firstValueFrom(
        this.http.delete(`${environment.backendURL}/transactions/${this.selectedTransactionId}`, {
          headers
        })
      );

      await this.loadTransactions();
      this.transactionsChanged.emit();
      this.showEdit = false;
    } catch (err) {
      console.error('Failed to delete transaction', err);
      this.error = 'Failed to delete transaction';
    } finally {
      this.cdr.detectChanges();
    }
  }

  private toNumber(val: Transaction['amount']): number {
    //number validator helper function
    if (val == null) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    }
    const dec = (val as any).$numberDecimal;
    if (dec !== undefined) {
      const num = Number(dec);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  private toCurrency(num: number): string {
    // specific currency formatter
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
