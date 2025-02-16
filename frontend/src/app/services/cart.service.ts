import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { CartItem, CartState } from '../interfaces/cart.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'cartState';
  private readonly CART_VISIBILITY_DURATION = 1000;

  private initialState: CartState = {
    items: [],
    isVisible: false,
  };

  private cartState = new BehaviorSubject<CartState>(this.loadCartState());
  private temporaryVisibilityTimer: any;

  constructor(private router: Router) {
    this.cartState.subscribe((state) => {
      this.saveCartState(state);
    });
  }

  private loadCartState(): CartState {
    const storedState = localStorage.getItem(this.CART_STORAGE_KEY);
    return storedState ? JSON.parse(storedState) : this.initialState;
  }

  private saveCartState(state: CartState): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(state));
  }

  getCartState(): Observable<CartState> {
    return this.cartState.asObservable();
  }

  toggleCart(): void {
    // Clear any existing timer
    if (this.temporaryVisibilityTimer) {
      clearTimeout(this.temporaryVisibilityTimer);
      this.temporaryVisibilityTimer = null;
    }

    const currentState = this.cartState.getValue();
    this.cartState.next({
      ...currentState,
      isVisible: !currentState.isVisible,
    });
  }

  private showCartTemporarily(): void {
    // Clear any existing timer
    if (this.temporaryVisibilityTimer) {
      clearTimeout(this.temporaryVisibilityTimer);
    }

    // Show the cart
    const currentState = this.cartState.getValue();
    if (!currentState.isVisible) {
      this.cartState.next({
        ...currentState,
        isVisible: true,
      });
    }

    // Set timer to hide the cart
    this.temporaryVisibilityTimer = setTimeout(() => {
      const state = this.cartState.getValue();
      this.cartState.next({
        ...state,
        isVisible: false,
      });
      this.temporaryVisibilityTimer = null;
    }, this.CART_VISIBILITY_DURATION);
  }

  addToCart(
    productId: string,
    categoryName: string,
    name: string,
    price: number,
    quantity: number = 1,
    image: string
  ): void {
    const currentState = this.cartState.getValue();
    const existingItem = currentState.items.find(
      (item) => item.id === productId
    );

    if (existingItem) {
      const updatedItems = currentState.items.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      this.cartState.next({
        ...currentState,
        items: updatedItems,
      });
    } else {
      const newItem: CartItem = {
        id: productId,
        name,
        price,
        quantity,
        image,
        category: categoryName,
      };
      this.cartState.next({
        ...currentState,
        items: [...currentState.items, newItem],
      });
    }

    // Show cart temporarily after adding item
    this.showCartTemporarily();
  }

  // Rest of the service methods remain unchanged
  updateQuantity(productId: string, newQuantity: number): void {
    const currentState = this.cartState.getValue();

    if (newQuantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const updatedItems = currentState.items.map((item) =>
      item.id === productId
        ? { ...item, quantity: Math.max(1, newQuantity) }
        : item
    );

    this.cartState.next({
      ...currentState,
      items: updatedItems,
    });
  }

  removeItem(productId: string): void {
    const currentState = this.cartState.getValue();
    this.cartState.next({
      ...currentState,
      items: currentState.items.filter((item) => item.id !== productId),
    });
  }

  removeAll(): void {
    const currentState = this.cartState.getValue();
    this.cartState.next({
      ...currentState,
      items: [],
    });
  }

  getTotal(): number {
    const currentState = this.cartState.getValue();
    return currentState.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  getItemCount(): number {
    const currentState = this.cartState.getValue();
    return currentState.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  proceedToCheckout(): void {
    const currentState = this.cartState.getValue();

    if (currentState.items.length > 0) {
      this.toggleCart();
      this.router.navigate(['/checkout']);
    }
  }

  getCurrentItems(): CartItem[] {
    return this.cartState.getValue().items;
  }
}
