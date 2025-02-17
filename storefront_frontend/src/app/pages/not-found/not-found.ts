// src/app/pages/not-found/not-found.ts
// Component displayed when a page or category is not found

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <section class="not-found">
      <h1 class="not-found_title">Page Not Found</h1>
      <p class="not-found_text">
        We couldn't find the page you're looking for.
      </p>
      <button class="not-found_button" routerLink="/">RETURN TO HOME</button>
    </section>
  `,
  styles: [
    `
      .not-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        padding: 2rem 1.5rem;
        text-align: center;
      }

      .not-found_title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        color: #101010;
      }

      .not-found_text {
        font-size: 1.125rem;
        line-height: 1.5;
        color: rgba(0, 0, 0, 0.5);
        margin-bottom: 3rem;
        max-width: 540px;
      }

      .not-found_button {
        background-color: #df704a;
        border: none;
        color: white;
        padding: 1rem 2rem;
        font-size: 0.875rem;
        font-weight: 700;
        letter-spacing: 1px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        text-transform: uppercase;

        &:hover {
          background-color: #f8af85;
        }
      }
    `,
  ],
})
export class NotFoundComponent {}
