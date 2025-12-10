import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MonthsForm } from './months-form/months-form';
import { TransactionForm } from '../transaction-form/transaction-form';
import { MonthsEdit } from '../months-edit/months-edit';
import { Month } from '../../../models/month/month-module';
import { getAuthUser, getIdTokenForAuth, onAuthChange } from '../../../services/firebase-implementation';
import { environment } from '../../../../environments/environment';
import { Unsubscribe } from 'firebase/auth';

@Component({
  selector: 'app-months-list',
  standalone: true,
  imports: [NgFor, NgIf, MonthsForm, TransactionForm, MonthsEdit],
  templateUrl: './months-list.html',
  styleUrl: './months-list.css',
})
export class MonthsList implements OnInit, OnDestroy {
  @Output() monthSelected = new EventEmitter<string | null>();
  months: Month[] = [];
  showForm = false;
  loading = false;
  error: string | null = null;
  showIncomeForm = false;
  showIncomeEdit = false;
  deleting = false;
  private authUnsub: Unsubscribe | null = null;
  selectedMonthId: string | null = null;

  constructor(private readonly http: HttpClient, private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    // When this loads, verify that the user is logged in, otherwise months won't load
    this.loading = true;
    this.authUnsub = onAuthChange(async user => {
      if (!user) {
        this.loading = false;
        this.error = 'Not authenticated';
        return;
      }
      await this.loadMonths();
    });
  }

  async loadMonths() {
    this.loading = true;
    this.error = null;
    try {
      const token = await getIdTokenForAuth();
      if (!token) {
        throw new Error('Not authenticated');
      }
      //Bearer token decodes user ID on the backend
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const results = await firstValueFrom(
        this.http.get<Month[]>(`${environment.backendURL}/months`, { headers })
      );
      this.months = results;
      if (this.months.length && !this.selectedMonthId) {
        this.selectedMonthId = this.months[0]._id ?? null;
        this.monthSelected.emit(this.selectedMonthId);
      }
    } catch (err) {
      console.error('Failed to load months', err);
      this.error = 'Failed to load months';
      this.months = [];
    } finally {
      this.loading = false;
      //make sure update happens
      this.cdr.detectChanges();
    }
  }

  toggleForm() {
    //HTML visibility
    this.showForm = !this.showForm;
  }

  toggleIncomeForm() {
    this.showIncomeForm = !this.showIncomeForm;
    if (this.showIncomeForm) {
      this.showIncomeEdit = false;
    }
  }

  onMonthAdded(month: Month) {
    //Update list on screen
    this.months = [...this.months, month];
    if (!this.selectedMonthId && month._id) {
      this.selectedMonthId = month._id;
      this.monthSelected.emit(this.selectedMonthId);
    }
    this.monthSelected.emit(this.selectedMonthId);
    this.cdr.detectChanges();
  }

  async reloadMonths() {
    await this.loadMonths();
    if (this.selectedMonthId) {
      this.monthSelected.emit(this.selectedMonthId);
    }
  }

  onFormClosed() {
    this.showForm = false;
    this.cdr.detectChanges();
  }

  async onIncomeAdded() {
    this.showIncomeForm = false;
    await this.loadMonths();
  }

  onIncomeClosed() {
    this.showIncomeForm = false;
    this.cdr.detectChanges();
  }

  toggleIncomeEdit() {
    this.showIncomeEdit = !this.showIncomeEdit;
    if (this.showIncomeEdit) {
      this.showIncomeForm = false;
    }
    this.cdr.detectChanges();
  }

  onSelect(monthId: string) {
    this.selectedMonthId = monthId;
    this.monthSelected.emit(monthId);
  }

  monthLabel(month: Month): string {
    const label = `${month.monthDigit}/${month.yearDigit}`;
    const total = this.formatTotal(month.totalAvailable);
    return `${label} • ${total}`;
  }

  formatTotal(val: Month['totalAvailable'] | undefined): string {
    const num = this.formatNumber(val);
    return this.toCurrency(num);
  }

  formatNumber(val: number | string | { $numberDecimal?: string } | undefined): number {
    if (val == null) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    }
    if ((val as any).$numberDecimal) {
      const num = Number((val as any).$numberDecimal);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  toCurrency(num: number): string {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async deleteSelected() {
    if (!this.selectedMonthId) return;
    this.deleting = true;
    try {
      const token = await getIdTokenForAuth();
      if (!token) throw new Error('Not authenticated');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(
        this.http.delete(`${environment.backendURL}/months/${this.selectedMonthId}`, { headers })
      );
      this.months = this.months.filter(m => (m._id ?? '') !== this.selectedMonthId);
      this.selectedMonthId = this.months[0]?._id ?? null;
    } catch (err) {
      console.error('Failed to delete month', err);
      this.error = 'Failed to delete month';
    } finally {
      this.deleting = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.authUnsub) this.authUnsub();
  }

  get selectedMonth(): Month | undefined {
    if (!this.selectedMonthId) return undefined;
    return this.months.find(m => m._id === this.selectedMonthId);
  }

  get incomesForSelected(): any[] {
    return (this.selectedMonth as any)?.incomes ?? [];
  }

  async onIncomeUpdated(update: { id: string; name: string; amount: number }) {
    if (!update?.id) return;
    try {
      const token = await getIdTokenForAuth();
      if (!token) throw new Error('Not authenticated');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(
        this.http.put(`${environment.backendURL}/transactions/${update.id}`, {
          name: update.name,
          amount: update.amount
        }, { headers })
      );
      await this.loadMonths();
      if (this.selectedMonthId) {
        this.monthSelected.emit(this.selectedMonthId);
      }
      this.showIncomeEdit = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Failed to update income', err);
      this.error = 'Failed to update income';
    }
  }

  async onIncomeDeleted(id: string) {
    if (!id) return;
    try {
      const token = await getIdTokenForAuth();
      if (!token) throw new Error('Not authenticated');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(
        this.http.delete(`${environment.backendURL}/transactions/${id}`, { headers })
      );
      await this.loadMonths();
      if (this.selectedMonthId) {
        this.monthSelected.emit(this.selectedMonthId);
      }
      this.showIncomeEdit = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Failed to delete income', err);
      this.error = 'Failed to delete income';
    }
  }
}
