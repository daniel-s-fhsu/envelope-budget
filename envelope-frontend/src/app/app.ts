import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavbar } from './components/top-navbar/top-navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopNavbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('envelope-frontend');
}
