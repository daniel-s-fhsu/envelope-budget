import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvelopeContainer } from './envelope-container';

describe('EnvelopeContainer', () => {
  let component: EnvelopeContainer;
  let fixture: ComponentFixture<EnvelopeContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnvelopeContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnvelopeContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
