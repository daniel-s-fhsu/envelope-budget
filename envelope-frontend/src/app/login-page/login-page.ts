import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { createUser, login } from '../auth/firebase-implementation';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  constructor(private readonly router: Router) {}

  email = '';
  password = '';
  status: string | null = null;

  async onLogin() {
    this.status = null;
    try {
      await login(this.email, this.password);
      await this.router.navigateByUrl('/');
    } catch (err) {
      console.error('Login failed', err);
      this.status = 'Login failed';
    }
  }

  async onCreate() {
    this.status = null;
    try {
      await createUser(this.email, this.password);
      await this.router.navigateByUrl('/');
    } catch (err) {
      console.error('Create account failed', err);
      this.status = 'Could not create account';
    }
  }
}
