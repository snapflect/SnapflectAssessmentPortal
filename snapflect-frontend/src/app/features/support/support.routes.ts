import { Routes } from '@angular/router';

export const SUPPORT_ROUTES: Routes = [
  {
    path: 'tickets',
    loadComponent: () => import('./pages/ticket-list/ticket-list.component').then(m => m.TicketListComponent)
  },
  {
    path: 'tickets/:id',
    loadComponent: () => import('./pages/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent)
  }
];
