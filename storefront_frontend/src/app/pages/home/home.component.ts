import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { ProductsComponent } from './products/products.component';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, MenuComponent, ProductsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
