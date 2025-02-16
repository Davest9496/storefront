import { Routes } from '@angular/router';
import { ScrollGuard } from './guards/scroll.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/home/home.routes').then((m) => m.HOME_ROUTES),
    canActivate: [ScrollGuard],
  },
  {
    path: 'category',
    loadChildren: () =>
      import('./pages/category/category.routes').then((m) => m.CATEGORY_ROUTES),
    canActivate: [ScrollGuard],
  },
  {
    path: 'product',
    loadChildren: () =>
      import('./pages/product-details/product.routes').then(
        (m) => m.PRODUCT_ROUTES
      ),
    canActivate: [ScrollGuard],
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./pages/check-out/check-out.routes').then(
        (m) => m.CHECKOUT_ROUTES
      ),
    canActivate: [ScrollGuard],
  },
  {
    path: 'checkout/confirmation',
    loadComponent: () =>
      import('./pages/confirmation/confirmation.component').then(
        (m) => m.ConfirmationComponent
      ),
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then((m) => m.NotFoundComponent),
    canActivate: [ScrollGuard],
  },
];
