import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Unsubscribe } from 'firebase/auth';
import { logout, onAuthChange } from '../auth/firebase-implementation';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './top-navbar.html',
  styleUrl: './top-navbar.css',
})
export class TopNavbar implements OnInit, OnDestroy {
  userEmail: string | null = null;
  private unsubscribeAuth: Unsubscribe | null = null;

  ngOnInit() {
    this.unsubscribeAuth = onAuthChange(user => {
      this.userEmail = user?.email ?? null;
    });
  }

  async onLogout() {
    await logout();
  }

  ngOnDestroy() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }
}
