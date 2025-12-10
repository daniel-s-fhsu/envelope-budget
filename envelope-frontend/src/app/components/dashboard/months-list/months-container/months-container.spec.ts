import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthsContainer } from './months-container';

describe('MonthsContainer', () => {
  let component: MonthsContainer;
  let fixture: ComponentFixture<MonthsContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthsContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthsContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
