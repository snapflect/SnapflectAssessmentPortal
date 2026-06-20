import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => Promise.resolve([]) // Placeholder for Auth lazy module
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => Promise.resolve([]) // Placeholder for Dashboard lazy module
  },
  {
    path: 'assessments',
    canActivate: [authGuard],
    loadChildren: () => Promise.resolve([]) // Placeholder for Assessments lazy module
  },
  {
    path: 'results',
    canActivate: [authGuard],
    loadChildren: () => Promise.resolve([]) // Placeholder for Results lazy module
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];