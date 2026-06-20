import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CandidateNavigationComponent } from '../navigation/candidate-navigation/candidate-navigation.component';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-candidate-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TopbarComponent, FooterComponent, CandidateNavigationComponent, MatToolbarModule],
  template: `
    <div class="candidate-layout-container">
      <app-topbar>
        <app-candidate-navigation></app-candidate-navigation>
      </app-topbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .candidate-layout-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
    }
    .main-content {
      flex: 1;
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
  `]
})
export class CandidateLayoutComponent {}