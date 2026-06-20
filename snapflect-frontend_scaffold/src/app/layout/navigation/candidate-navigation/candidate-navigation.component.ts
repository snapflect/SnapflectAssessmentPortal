import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-candidate-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: `
    <nav class="candidate-nav">
      <button mat-button routerLink="/candidate/dashboard">Dashboard</button>
      <button mat-button routerLink="/candidate/assessments">My Assessments</button>
      <button mat-button routerLink="/candidate/results">My Results</button>
    </nav>
  `,
  styles: [`
    .candidate-nav { display: flex; gap: 8px; }
  `]
})
export class CandidateNavigationComponent {}