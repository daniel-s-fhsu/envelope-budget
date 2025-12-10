import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Month } from '../../../../models/month/month-module';

@Component({
  selector: 'app-months-container',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './months-container.html',
  styleUrl: './months-container.css',
})
export class MonthsContainer {
  @Input() month: Month | null = null;

  get monthLabel(): string {
    if (!this.month) return '';
    const { monthDigit, yearDigit } = this.month;
    return `${monthDigit}/${yearDigit}`;
  }

  get totalAvailable(): string {
    const val: any = this.month?.totalAvailable;
    if (val == null) return '0';
    if (typeof val === 'number') return val.toFixed(2);
    if (typeof val === 'string') {
      const num = Number(val);
      return isNaN(num) ? val : num.toFixed(2);
    }
    // handle Decimal128 JSON from Mongo
    if (val.$numberDecimal) {
      const num = Number(val.$numberDecimal);
      return isNaN(num) ? val.$numberDecimal : num.toFixed(2);
    }
    return `${val}`;
  }
}
