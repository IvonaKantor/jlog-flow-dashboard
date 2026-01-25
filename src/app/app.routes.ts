import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
