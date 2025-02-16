// src/app/pages/category/category-item/category-item.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryItem } from '../../../interfaces/category.interface';
import { ButtonComponent } from '../../../components/button/button.component';

@Component({
  selector: 'app-category-item',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss'],
})
export class CategoryItemComponent {
  @Input({ required: true }) item!: CategoryItem;

  constructor(private router: Router) {}


  navigateToProduct(): void {
    this.router.navigate(['/product', this.item.id]);
  }
}
