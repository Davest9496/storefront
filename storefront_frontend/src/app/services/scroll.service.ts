import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  constructor(private router: Router) {
    // Listen to router navigation end events
    this.router.events
      .pipe(
        // Filter for NavigationEnd events
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          // Scroll to top with smooth behavior
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        });
      });
  }

  // Manual method, responding to click  events
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }
}
