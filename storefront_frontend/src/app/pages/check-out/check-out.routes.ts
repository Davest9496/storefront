import { Routes } from '@angular/router';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./check-out.component').then((m) => m.CheckOutComponent),
  },
];
