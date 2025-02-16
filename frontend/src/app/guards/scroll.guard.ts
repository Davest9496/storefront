import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ScrollService } from '../services/scroll.service';

@Injectable({
  providedIn: 'root',
})
export class ScrollGuard implements CanActivate {
  constructor(private scrollService: ScrollService) {}

  canActivate(): boolean {
    // Use our existing scroll service to handle the scrolling
    this.scrollService.scrollToTop();
    // Always allow the navigation to proceed
    return true;
  }
}
