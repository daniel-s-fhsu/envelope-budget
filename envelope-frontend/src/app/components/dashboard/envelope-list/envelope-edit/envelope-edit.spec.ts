import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvelopeEdit } from './envelope-edit';

describe('EnvelopeEdit', () => {
  let component: EnvelopeEdit;
  let fixture: ComponentFixture<EnvelopeEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnvelopeEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnvelopeEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
