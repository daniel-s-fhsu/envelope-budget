import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthsEdit } from './months-edit';

describe('MonthsEdit', () => {
  let component: MonthsEdit;
  let fixture: ComponentFixture<MonthsEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthsEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthsEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
