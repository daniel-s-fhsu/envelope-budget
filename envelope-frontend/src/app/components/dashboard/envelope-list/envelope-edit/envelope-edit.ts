import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Envelope } from '../../../../models/envelope/envelope-module';

@Component({
  selector: 'app-envelope-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './envelope-edit.html',
  styleUrl: './envelope-edit.css',
})
export class EnvelopeEdit implements OnInit, OnChanges {
  @Input() envelope: Envelope | null = null;
  @Output() saved = new EventEmitter<{ name: string; allocated: number }>();
  @Output() deleted = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      allocated: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.patchForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['envelope']) {
      this.patchForm();
    }
  }

  private patchForm() {
    if (!this.envelope) return;
    const allocatedVal = this.normalizeNumber(this.envelope.allocated);
    this.form.patchValue({
      name: this.envelope.name ?? '',
      allocated: allocatedVal,
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.saved.emit({
      name: this.form.value.name,
      allocated: this.form.value.allocated,
    });
  }

  onDelete() {
    this.deleted.emit();
  }

  onCancel() {
    this.closed.emit();
  }

  private normalizeNumber(val: Envelope['allocated']): number {
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
