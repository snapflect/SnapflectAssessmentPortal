import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-layout-container">
      <div class="auth-content-wrapper">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
      font-family: 'Inter', sans-serif;
    }
    .auth-content-wrapper {
      width: 100%;
      max-width: 480px;
      padding: 24px;
    }
  `]
})
export class AuthLayoutComponent {}