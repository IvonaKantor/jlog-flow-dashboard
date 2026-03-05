import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/log-dashboard.component')
      .then(m => m.LogDashboardComponent)
  },
  {
    path: 'logs',
    loadComponent: () => import('')
      .then(m => m.LogsPageComponent)
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
