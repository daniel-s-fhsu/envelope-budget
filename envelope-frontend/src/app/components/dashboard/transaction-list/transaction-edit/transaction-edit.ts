import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Transaction } from '../../../../models/transaction/transaction-module';

@Component({
  selector: 'app-transaction-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-edit.html',
  styleUrl: './transaction-edit.css',
})
export class TransactionEdit implements OnInit, OnChanges {
  @Input() transaction: Transaction | null = null;
  @Output() saved = new EventEmitter<{ name: string; description: string; amount: number }>();
  @Output() deleted = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      amount: [0, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.patchForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transaction']) {
      this.patchForm();
    }
  }

  private patchForm() {
    if (!this.transaction) return;
    const amt = this.normalizeNumber(this.transaction.amount);
    this.form.patchValue({
      name: this.transaction.name ?? '',
      description: this.transaction.description ?? '',
      amount: amt
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.saved.emit({
      name: this.form.value.name,
      description: this.form.value.description ?? '',
      amount: this.form.value.amount
    });
  }

  onDelete() {
    this.deleted.emit();
  }

  onCancel() {
    this.closed.emit();
  }

  private normalizeNumber(val: Transaction['amount']): number {
    //Makesure number is number
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
}
