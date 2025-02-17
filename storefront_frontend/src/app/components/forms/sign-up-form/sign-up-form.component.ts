import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sign-up-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="sign-up-form" (ngSubmit)="onSubmit()" #signUpForm="ngForm">
      <div class="form-group">
        <label for="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          [(ngModel)]="formData.name"
          required
          minlength="2"
          #name="ngModel"
          [class.error]="name.invalid && (name.dirty || name.touched)"
          placeholder="Enter your full name"
        />
        <div
          class="error-message"
          *ngIf="name.invalid && (name.dirty || name.touched)"
        >
          <span *ngIf="name.errors?.['required']">Name is required</span>
          <span *ngIf="name.errors?.['minlength']"
            >Name must be at least 2 characters</span
          >
        </div>
      </div>

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
          [class.error]="email.invalid && (email.dirty || email.touched)"
          placeholder="Enter your email"
        />
        <div
          class="error-message"
          *ngIf="email.invalid && (email.dirty || email.touched)"
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
          [class.error]="
            password.invalid && (password.dirty || password.touched)
          "
          placeholder="Create a password"
        />
        <div
          class="error-message"
          *ngIf="password.invalid && (password.dirty || password.touched)"
        >
          <span *ngIf="password.errors?.['required']"
            >Password is required</span
          >
          <span *ngIf="password.errors?.['minlength']"
            >Password must be at least 6 characters</span
          >
        </div>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          [(ngModel)]="formData.confirmPassword"
          required
          #confirmPassword="ngModel"
          [class.error]="
            confirmPassword.value !== formData.password &&
            (confirmPassword.dirty || confirmPassword.touched)
          "
          placeholder="Confirm your password"
        />
        <div
          class="error-message"
          *ngIf="
            confirmPassword.value !== formData.password &&
            (confirmPassword.dirty || confirmPassword.touched)
          "
        >
          Passwords do not match
        </div>
      </div>

      <button
        type="submit"
        [disabled]="
          signUpForm.invalid ||
          isLoading ||
          formData.password !== formData.confirmPassword
        "
        class="submit-btn"
      >
        {{ isLoading ? 'Signing up...' : 'Sign Up' }}
      </button>
    </form>
  `,
  styleUrls: ['./sign-up-form.component.scss'],
})
export class SignUpFormComponent {
  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      // TODO: Implement actual registration logic
      console.log('Sign up attempt with:', this.formData);
      this.isLoading = false;
      // Navigate back or to home
      const previousUrl = sessionStorage.getItem('previousUrl') || '/';
      await this.router.navigateByUrl(previousUrl);
    } catch (error) {
      console.error('Sign up error:', error);
      this.isLoading = false;
    }
  }
}
