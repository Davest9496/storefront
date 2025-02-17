import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { CategoryItemComponent } from './category-item/category-item.component';
import { Category, CategoryItem } from '../../interfaces/category.interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, CategoryItemComponent, RouterModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit, OnDestroy {
  category?: Category;
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['category']) {
        this.loadCategory(params['category']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategory(categoryName: string): void {
    this.loading = true;
    this.error = '';

    this.categoryService
      .getCategoryByName(categoryName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (category) => {
          this.loading = false;
          if (category) {
            this.category = category;
          } else {
            this.router.navigate(['/not-found']);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Failed to load category. Please try again later.';
          console.error('Error loading category:', err);
        },
      });
  }

  trackById(_: number, item: CategoryItem): string {
    return item.id;
  }
}
