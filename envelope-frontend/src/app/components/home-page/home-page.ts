import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <div class="container py-5">
      <h1 class="h4 mb-3">Please login</h1>
      <p class="text-muted mb-0">Please login to use the budeting app</p>
    </div>
  `
})
export class HomePage {}
