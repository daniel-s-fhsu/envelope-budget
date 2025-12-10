import { Component, ViewChild } from '@angular/core';
import { MonthsList } from './months-list/months-list';
import { EnvelopeList } from './envelope-list/envelope-list';
import { TransactionList } from './transaction-list/transaction-list';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MonthsList, EnvelopeList, TransactionList],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  selectedMonthId: string | null = null;
  selectedEnvelopeId: string | null = null;
  @ViewChild(MonthsList) monthsList?: MonthsList;
  @ViewChild(EnvelopeList) envelopeList?: EnvelopeList;

  onMonthSelected(monthId: string | null) {
    this.selectedMonthId = monthId;
    this.selectedEnvelopeId = null;
  }

  onEnvelopeSelected(envelopeId: string | null) {
    this.selectedEnvelopeId = envelopeId;
  }

  async onMonthsRefresh() {
    await this.monthsList?.reloadMonths();
  }

  async onTransactionsChanged() {
    await this.envelopeList?.reload();
    await this.monthsList?.reloadMonths();
  }
}
