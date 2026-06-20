import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <p>&copy; 2026 Snapflect Assessment Portal. All rights reserved.</p>
    </footer>
  `,
  styles: [`
    .footer { padding: 16px; text-align: center; color: #757575; font-size: 0.875rem; border-top: 1px solid #e0e0e0; }
  `]
})
export class FooterComponent {}