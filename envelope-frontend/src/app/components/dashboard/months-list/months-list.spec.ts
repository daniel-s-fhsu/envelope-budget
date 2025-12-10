import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthsList } from './months-list';

describe('MonthsList', () => {
  let component: MonthsList;
  let fixture: ComponentFixture<MonthsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
