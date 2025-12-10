import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { getAuthUser, getIdTokenForAuth } from '../../../../services/firebase-implementation';
import { Month } from '../../../../models/month/month-module';

@Component({
  selector: 'app-months-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './months-form.html',
  styleUrl: './months-form.css',
})
export class MonthsForm {
  @Input() months: Month[] = [];
  @Output() monthAdded = new EventEmitter<Month>();
  @Output() closed = new EventEmitter<void>();
  form: FormGroup;
  status: string | null = null;
  submitting = false;

  constructor(private readonly fb: FormBuilder, private readonly http: HttpClient) {
    const now = new Date();
    this.form = this.fb.group({
      monthDigit: [now.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      yearDigit: [now.getFullYear(), [Validators.required, Validators.min(1970)]]
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.status = 'Please fix form errors.';
      return;
    }

    this.submitting = true;
    this.status = null;

    try {
      // First check for duplicate months
      const duplicate = this.months.some(
        m =>
          m.monthDigit === this.form.value.monthDigit &&
          m.yearDigit === this.form.value.yearDigit
      );
      if (duplicate) {
        this.status = 'That month/year already exists.';
        this.submitting = false;
        return;
      }

      // Verify user auth
      const user = await getAuthUser();
      const token = await getIdTokenForAuth();
      if (!token || !user) throw new Error('Not authenticated');

      // Build month json
      const payload: Month = {
        firebaseUserId: user.uid,
        monthDigit: this.form.value.monthDigit,
        yearDigit: this.form.value.yearDigit,
        totalAvailable: 0,
        incomes: [],
        envelopes: []
      };

      //POST req
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const saved = await firstValueFrom(
        this.http.post<Month>(`${environment.backendURL}/months`, payload, { headers })
      );

      this.status = 'Month added';
      this.monthAdded.emit(saved);
      const now = new Date();
      
      //Reset and close form

      this.form.reset({
        monthDigit: now.getMonth() + 1,
        yearDigit: now.getFullYear()
      });
      this.closed.emit();
    } catch (err) {
      console.error('Failed to add month', err);
      this.status = 'Failed to add month';
    } finally {
      this.submitting = false;
    }
  }
}
