import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Envelope } from '../../../../models/envelope/envelope-module';

@Component({
  selector: 'app-envelope-container',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './envelope-container.html',
  styleUrl: './envelope-container.css',
})
export class EnvelopeContainer {
  @Input() showForm = false;
  @Input() monthId: string | null = null;
  @Input() envelopes: Envelope[] = [];
  @Input() selectedEnvelopeId: string | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() showButtons = true;
  @Output() toggleRequested = new EventEmitter<void>();
  @Input() showEdit = false;
  @Output() editRequested = new EventEmitter<void>();
  @Output() envelopeSelected = new EventEmitter<string>();

  onSelect(id: string) {
    this.envelopeSelected.emit(id);
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

  private toNumberAllocated(val: Envelope['allocated']): number {
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
