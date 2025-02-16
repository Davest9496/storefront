import { Component } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-popular-products',
  imports: [ButtonComponent, CommonModule],
  templateUrl: './popular-products.component.html',
  styleUrl: './popular-products.component.scss',
})
export class PopularProductsComponent {
  constructor(private router: Router) {}

  products = [
    {
      id: 'xx99-mark-one',
      name: 'XX99 MARK I',
      image: {
        mobile: 'assets/shared/mobile/image-xx99-mark-one-headphones.jpg',
        tablet: 'assets/shared/tablet/image-xx99-mark-one-headphones.jpg',
        desktop: 'assets/shared/desktop/image-xx99-mark-one-headphones.jpg',
      },
    },
    {
      id: 'xx59',
      name: 'XX59',
      image: {
        mobile: 'assets/shared/mobile/image-xx59-headphones.jpg',
        tablet: 'assets/shared/tablet/image-xx59-headphones.jpg',
        desktop: 'assets/shared/desktop/image-xx59-headphones.jpg',
      },
    },
    {
      id: 'zx9',
      name: 'ZX9 SPEAKER',
      image: {
        mobile: 'assets/shared/mobile/image-zx9-speaker.jpg',
        tablet: 'assets/shared/tablet/image-zx9-speaker.jpg',
        desktop: 'assets/shared/desktop/image-zx9-speaker.jpg',
      },
    },
  ];

  trackById(index: number, product: any): string {
    return product.id;
  }

  async navigateToProduct(productId: string): Promise<void> {

    // Define navigation extras to force route reuse strategy
    const navigationExtras: NavigationExtras = {
      onSameUrlNavigation: 'reload',
      state: { forceReload: true },
    };

    try {
      // First navigate away to force component destruction
      await this.router.navigateByUrl('/', { skipLocationChange: true });

      // Then navigate to the product page
      const result = await this.router.navigate(
        ['/product', productId],
        navigationExtras
      );

      //-- Debugger for Navogation to product-details --//
      console.log('Navigation completed:', {
        success: result,
        productId: productId,
        currentUrl: this.router.url,
      });
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }
}
