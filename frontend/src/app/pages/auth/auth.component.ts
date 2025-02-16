import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SignInFormComponent } from '../../components/forms/sign-in-form/sign-in-form.component';
import { SignUpFormComponent } from '../../components/forms/sign-up-form/sign-up-form.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SignInFormComponent,
    SignUpFormComponent,
  ],
  template: `
    <div class="auth">
      <div class="auth_container">
        <h1 class="auth_title">
          {{ isLogin ? 'Welcome Back' : 'Create Account' }}
        </h1>

        <!-- Toggle Buttons -->
        <div class="auth_toggle">
          <button
            [class.active]="isLogin"
            (click)="setAuthMode('login')"
            type="button"
          >
            Sign In
          </button>
          <button
            [class.active]="!isLogin"
            (click)="setAuthMode('register')"
            type="button"
          >
            Sign Up
          </button>
        </div>

        <!-- Dynamic Form -->
        <div class="auth_form">
          <app-sign-in-form *ngIf="isLogin" />
          <app-sign-up-form *ngIf="!isLogin" />
        </div>

        <!-- Toggle Link -->
        <p class="auth_switch">
          {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
          <button
            class="auth_switch-btn"
            (click)="toggleAuthMode()"
            type="button"
          >
            {{ isLogin ? 'Sign Up' : 'Sign In' }}
          </button>
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  isLogin = true;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Store the previous URL for redirect after auth
    const navigation = this.router.getCurrentNavigation();
    const previousUrl = navigation?.previousNavigation?.finalUrl?.toString();
    if (previousUrl) {
      sessionStorage.setItem('previousUrl', previousUrl);
    }

    // Set initial mode based on route
    const mode = this.route.snapshot.params['mode'];
    this.isLogin = mode !== 'register';
  }

  setAuthMode(mode: 'login' | 'register') {
    this.isLogin = mode === 'login';
    this.router.navigate(['/auth', mode]);
  }

  toggleAuthMode() {
    this.setAuthMode(this.isLogin ? 'register' : 'login');
  }
}
