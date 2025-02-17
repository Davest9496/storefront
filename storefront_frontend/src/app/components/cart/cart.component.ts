import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CartItem, CartState } from '../../interfaces/cart.interface';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartState$: Observable<CartState>;

  constructor(public cartService: CartService, private router: Router) {
    this.cartState$ = this.cartService.getCartState();
  }

  ngOnInit(): void {}

  updateQuantity(itemId: string, newQuantity: number): void {
    this.cartService.updateQuantity(itemId, newQuantity);
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId);
  }

  removeAll(): void {
    this.cartService.removeAll();
  }

  closeCart(): void {
    this.cartService.toggleCart();
  }

  trackByFn(index: number, item: CartItem): string {
    return item.id;
  }

  onCheckout(): void {
    this.cartService.proceedToCheckout();
  }
}
