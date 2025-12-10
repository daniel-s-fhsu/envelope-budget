import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { HomePage } from './components/home-page/home-page';
import { LoginPage } from './components/login-page/login-page';
import { authGuard } from './services/auth-guard';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'login', component: LoginPage },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] }
];
