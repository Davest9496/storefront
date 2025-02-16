import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '@app/services/order.service';
import { CartItem } from '../../interfaces/cart.interface';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.scss'],
})
export class SummaryComponent {
  @Input() checkoutForm!: FormGroup;
  @Input() formStatusChange!: boolean;
  constructor(
    private cartService: CartService,
    private router: Router,
    private orderService: OrderService
  ) {}

  readonly shippingRate = 0.05;
  readonly vatRate = 0.2;
  loading: boolean = false;

  // Get items directly from cart service
  get items(): CartItem[] {
    return this.cartService.getCurrentItems();
  }

  get subtotal(): number {
    return this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  get shippingCost(): number {
    const cost = this.subtotal * this.shippingRate;
    // set shipping cap at £30
    return cost > 30 ? 30 : cost;
  }
  get vat(): number {
    return parseFloat((this.subtotal * this.vatRate).toFixed(2));
  }

  get grandTotal(): number {
    return this.subtotal + this.shippingCost + this.vat;
  }

  async handleCheckout(): Promise<void> {
    this.loading = true;
    try {
      const orderData = {
        items: this.items,
        subtotal: this.subtotal,
        shipping: this.shippingCost,
        vat: this.vat,
        total: this.grandTotal,
        formData: this.checkoutForm?.value,
      };

      console.log('Processing order:', orderData);

      // Set the grandTotal in the shared service
      this.orderService.setGrandTotal(this.grandTotal);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await this.router.navigate(['/checkout/confirmation']);
    } catch (error) {
      console.error('Error processing checkout:', error);
    } finally {
      this.loading= false;
    }
  }
}
