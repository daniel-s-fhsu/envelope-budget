import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { getIdTokenForAuth } from '../../../services/firebase-implementation';
import { Transaction } from '../../../models/transaction/transaction-module';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.css',
})
export class TransactionForm {
  @Input() monthId: string | null = null;
  @Input() envelopeId: string | null = null;
  @Input() refreshMonths: (() => Promise<void>) | null = null;
  @Input() label = 'Add Transaction';
  @Output() transactionAdded = new EventEmitter<Transaction>();
  @Output() closed = new EventEmitter<void>();

  form: FormGroup;
  status: string | null = null;
  submitting = false;

  constructor(private readonly fb: FormBuilder, private readonly http: HttpClient) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      amount: [0, [Validators.required]]
    });
  }

  async submit() {
    //submit for tx form
    if (this.form.invalid || !this.monthId) {
      this.status = 'Missing required info';
      return;
    }
    
    this.submitting = true;
    this.status = null;

    try {
      const token = await getIdTokenForAuth();
      if (!token) throw new Error('Not authenticated');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      const payload: Transaction = {
        firebaseUserId: '',
        monthId: this.monthId,
        envelopeId: this.envelopeId ?? undefined,
        name: this.form.value.name,
        description: this.form.value.description ?? '',
        amount: this.form.value.amount
      };

      const saved = await firstValueFrom(
        this.http.post<Transaction>(`${environment.backendURL}/transactions`, payload, { headers })
      );

      this.transactionAdded.emit(saved);
      if (!this.envelopeId && this.refreshMonths) {
        await this.refreshMonths();
      }
      this.form.reset({ name: '', description: '', amount: 0 });
      //close the form on submit
      this.closed.emit();
    } catch (err) {
      console.error('Failed to save transaction', err);
      this.status = 'Failed to save transaction';
    } finally {
      this.submitting = false;
    }
  }
}
