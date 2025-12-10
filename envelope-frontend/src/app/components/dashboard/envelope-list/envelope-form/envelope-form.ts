import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-envelope-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './envelope-form.html',
  styleUrl: './envelope-form.css',
})
export class EnvelopeForm {
  @Output() envelopeAdded = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      allocated: [0, [Validators.required, Validators.min(0)]]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.envelopeAdded.emit(this.form.value);
    this.form.reset({ name: '', allocated: 0 });
    this.closed.emit();
  }
}
