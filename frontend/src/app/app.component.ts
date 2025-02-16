import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { BestGearComponent } from './components/best-gear/best-gear.component';
import { FooterComponent } from './components/footer/footer.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterOutlet, BestGearComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'storefront';

  showBestGear: boolean = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showBestGear = !event.url.includes('/checkout');
        this.showBestGear = this.showBestGear && !event.url.includes('/auth');
      });
  }
}
