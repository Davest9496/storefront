import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Category } from '../interfaces/category.interface';

interface CategoriesResponse {
  categories: Category[];
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'assets/data/categories.json';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<CategoriesResponse>(this.apiUrl).pipe(
      map((response) => response.categories),
      catchError((error) => {
        console.error('Error fetching categories:', error);
        return of([]);
      })
    );
  }

  getCategoryByName(name: string): Observable<Category | undefined> {
    return this.getCategories().pipe(
      map((categories) =>
        categories.find(
          (category) => category.name.toLowerCase() === name.toLowerCase()
        )
      ),
      catchError((error) => {
        console.error(`Error fetching category ${name}:`, error);
        return of(undefined);
      })
    );
  }
}
