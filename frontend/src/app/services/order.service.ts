import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private grandTotal: number = 0;

  setGrandTotal(total: number): void {
    this.grandTotal = total;
  }

  getGrandTotal(): number {
    return this.grandTotal;
  }
}
