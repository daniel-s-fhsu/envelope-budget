import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <div class="container py-5">
      <h1 class="h4 mb-3">Home</h1>
      <p class="text-muted mb-0">Welcome! Add your dashboard content here.</p>
    </div>
  `
})
export class HomePage {}
