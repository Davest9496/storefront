import { Routes } from '@angular/router';
import { ConfirmationComponent } from './confirmation.component';

export const CONFIRMATION_ROUTES: Routes = [
  {
    path: '',
    component: ConfirmationComponent,
    title: 'Order Confirmation',
  },
];
