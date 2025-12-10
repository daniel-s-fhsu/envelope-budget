import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Transaction } from '../../../models/transaction/transaction-module';

@Component({
  selector: 'app-months-edit',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './months-edit.html',
  styleUrl: './months-edit.css',
})
export class MonthsEdit implements OnChanges {
  @Input() incomes: Transaction[] = [];
  @Output() incomeUpdated = new EventEmitter<{ id: string; name: string; amount: number }>();
  @Output() incomeDeleted = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  formMap: Record<string, FormGroup> = {};

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    // if something changes in incomes...
    if (changes['incomes']) {
      this.buildForms();
    }
  }

  private buildForms() {
    this.formMap = {};
    for (const inc of this.incomes) {
      const amt = this.normalizeNumber(inc.amount);
      this.formMap[inc._id ?? inc.name] = this.fb.group({
        name: [inc.name ?? '', Validators.required],
        amount: [amt, [Validators.required]]
      });

    }
  }

  formFor(id: string): FormGroup | null {
    return this.formMap[id] ?? null;
  }

  save(id: string) {
    const form = this.formFor(id);
    if (!form || form.invalid) return;
    this.incomeUpdated.emit({
      id,
      name: form.value.name,
      amount: form.value.amount
    });
  }

  delete(id: string) {
    this.incomeDeleted.emit(id);
  }

  close() {
    this.closed.emit();
  }

  private normalizeNumber(val: Transaction['amount']): number {
    // num validator
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
