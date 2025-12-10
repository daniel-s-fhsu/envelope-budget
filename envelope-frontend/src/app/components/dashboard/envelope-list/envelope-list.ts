import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { EnvelopeForm } from './envelope-form/envelope-form';
import { EnvelopeEdit } from './envelope-edit/envelope-edit';
import { EnvelopeContainer } from './envelope-container/envelope-container';
import { Envelope } from '../../../models/envelope/envelope-module';
import { getIdTokenForAuth } from '../../../services/firebase-implementation';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-envelope-list',
  standalone: true,
  imports: [NgIf, EnvelopeForm, EnvelopeEdit, EnvelopeContainer],
  templateUrl: './envelope-list.html',
  styleUrl: './envelope-list.css',
})
export class EnvelopeList implements OnInit, OnChanges {
  @Input() monthId: string | null = null;
  @Output() envelopeSelected = new EventEmitter<string | null>();
  @Output() monthsRefresh = new EventEmitter<void>();

  envelopes: Envelope[] = [];
  showForm = false;
  showEdit = false;
  selectedEnvelopeId: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(private readonly http: HttpClient, private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    if (this.monthId) {
      await this.loadEnvelopes();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // reload envelopes on changes
    if (changes['monthId']) {
      this.loadEnvelopes();
    }
  }

  async reload() {
    await this.loadEnvelopes();
  }

  async loadEnvelopes() {
    this.envelopes = [];
    this.selectedEnvelopeId = null;

    //Nothing selected?
    if (!this.monthId) {
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
        this.http.get<Envelope[]>(`${environment.backendURL}/envelopes`, {
          headers,
          params: { monthId: this.monthId }
        })
      );
      this.envelopes = data;
      this.selectedEnvelopeId = this.envelopes[0]?._id ?? null;
      this.envelopeSelected.emit(this.selectedEnvelopeId);
    } catch (err) {
      console.error('Failed to load envelopes', err);
      //This.error shows an error in form
      this.error = 'Failed to load envelopes';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.showEdit = false;
    }
  }

  async onEnvelopeAdded(env: { name: string; allocated: number }) {
    //Submit new envelope form
    if (!this.monthId) return;
    try {
      const token = await getIdTokenForAuth();
      if (!token) throw new Error('Not authenticated');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const payload: Envelope = {
        firebaseUserId: '',
        monthId: this.monthId,
        name: env.name,
        allocated: env.allocated,
        expenses: []
      };
      const saved = await firstValueFrom(
        this.http.post<Envelope>(`${environment.backendURL}/envelopes`, payload, { headers })
      );
      await this.loadEnvelopes();
      this.selectedEnvelopeId = saved._id ?? null;
      this.showForm = false;
      this.monthsRefresh.emit();
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Failed to add envelope', err);
      this.error = 'Failed to add envelope';
    }
  }

  async onEnvelopeEdited(update: { name: string; allocated: number }) {
    if (!this.monthId || !this.selectedEnvelopeId) return;
    try {
      const token = await getIdTokenForAuth();
      if (!token) throw new Error('Not authenticated');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(
        this.http.put<Envelope>(
          `${environment.backendURL}/envelopes/${this.selectedEnvelopeId}`,
          update,
          { headers }
        )
      );
      await this.loadEnvelopes();
      this.showEdit = false;
      this.monthsRefresh.emit();
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Failed to update envelope', err);
      this.error = 'Failed to update envelope';
    }
  }

  async onEnvelopeDeleted() {
    if (!this.selectedEnvelopeId) return;
    try {
      const token = await getIdTokenForAuth();
      if (!token) throw new Error('Not authenticated');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(
        this.http.delete(`${environment.backendURL}/envelopes/${this.selectedEnvelopeId}`, { headers })
      );
      await this.loadEnvelopes();
      this.showEdit = false;
      this.monthsRefresh.emit();
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Failed to delete envelope', err);
      this.error = 'Failed to delete envelope';
    }
  }

  toggleEdit() {
    this.showEdit = !this.showEdit;
    if (this.showEdit) {
      this.showForm = false;
    }
  }

  onSelect(id: string) {
    //Make sure that updates happen when envelope selected
    this.selectedEnvelopeId = id;
    this.envelopeSelected.emit(id);
    this.showEdit = false;
    this.cdr.detectChanges();
  }

  formatAllocated(val: Envelope['allocated']): string {
    const num = this.toNumberAllocated(val);
    return this.toCurrency(num);
  }

  remainingValue(remaining: number | undefined, allocated: Envelope['allocated']): number {
    if (remaining == null) {
      return this.toNumberAllocated(allocated);
    }
    return remaining;
  }

  formatRemaining(remaining: number | undefined, allocated: Envelope['allocated']): string {
    const val = this.remainingValue(remaining, allocated);
    return this.toCurrency(val);
  }

  get selectedEnvelope(): Envelope | undefined {
    return this.envelopes.find(e => e._id === this.selectedEnvelopeId);
  }

  private toNumberAllocated(val: Envelope['allocated']): number {
    //check for string or object, make sure it's a number
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
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
