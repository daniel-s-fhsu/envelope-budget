import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthsForm } from './months-form';

describe('MonthsForm', () => {
  let component: MonthsForm;
  let fixture: ComponentFixture<MonthsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
