import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonComponent } from '../../../components/button/button.component';

interface Product {
  id: string;
  name: string;
  description?: string;
  image: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  pattern?: string;
  class: 'product_featured' | 'product_secondary' | 'product_tertiary';
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ButtonComponent, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<{ products: Product[] }>('assets/data/products.json')
      .subscribe((data) => {
        this.products = data.products;
      });
  }
}
