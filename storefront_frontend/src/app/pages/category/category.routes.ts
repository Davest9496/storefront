import { Routes } from '@angular/router';

export const CATEGORY_ROUTES: Routes = [
  {
    path: ':category',
    loadComponent: () =>
      import('./category.component').then((m) => m.CategoryComponent),
    data: {
      title: 'Category Page - Earphones, Headphones, Speakers',
    },
  },
];
