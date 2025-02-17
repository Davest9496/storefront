import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sign-in-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="sign-in-form" (ngSubmit)="onSubmit()" #signInForm="ngForm">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          [(ngModel)]="formData.email"
          required
          email
          #email="ngModel"
          [class.error]="email.invalid && email.touched"
          placeholder="Enter your email"
        />
        <div
          class="error-message"
          *ngIf="email.touched && email.invalid"
          @fadeInOut
        >
          <span *ngIf="email.errors?.['required']">Email is required</span>
          <span *ngIf="email.errors?.['email']"
            >Please enter a valid email</span
          >
        </div>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          [(ngModel)]="formData.password"
          required
          minlength="6"
          #password="ngModel"
          [class.error]="password.invalid && password.touched"
          placeholder="Enter your password"
        />
        <div
          class="error-message"
          *ngIf="password.touched && password.invalid"
          @fadeInOut
        >
          <span *ngIf="password.errors?.['required']"
            >Password is required</span
          >
          <span *ngIf="password.errors?.['minlength']"
            >Password must be at least 6 characters</span
          >
        </div>
      </div>

      <button
        type="submit"
        [disabled]="signInForm.invalid || isLoading"
        class="submit-btn"
      >
        {{ isLoading ? 'Signing in...' : 'SIGN IN' }}
      </button>
    </form>
  `,
  styleUrls: ['./sign-in-form.component.scss'],
})
export class SignInFormComponent {
  formData = {
    email: '',
    password: '',
  };

  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      // TODO: Implement actual authentication logic
      console.log('Sign in attempt with:', this.formData);
      this.isLoading = false;
      // Navigate back or to home
      const previousUrl = sessionStorage.getItem('previousUrl') || '/';
      await this.router.navigateByUrl(previousUrl);
    } catch (error) {
      console.error('Sign in error:', error);
      this.isLoading = false;
    }
  }
}
