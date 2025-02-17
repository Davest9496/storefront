import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    // Initialize with stored user data if available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser.next(JSON.parse(storedUser));
    }
  }

  isLoggedIn(): Observable<boolean> {
    return this.currentUser.pipe(map((user) => user !== null));
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  logout(): void {
    this.currentUser.next(null);
    localStorage.removeItem('user');
  }
}