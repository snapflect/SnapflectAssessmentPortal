import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AdminNavigationComponent } from '../navigation/admin-navigation/admin-navigation.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, FooterComponent, AdminNavigationComponent, MatSidenavModule],
  template: `
    <mat-sidenav-container class="admin-layout-container">
      <mat-sidenav #sidenav [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()">
        <app-sidebar>
          <app-admin-navigation></app-admin-navigation>
        </app-sidebar>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <app-topbar (toggleMenu)="sidenav.toggle()"></app-topbar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
        <app-footer></app-footer>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .admin-layout-container {
      height: 100vh;
      font-family: 'Inter', sans-serif;
    }
    .main-content {
      padding: 24px;
      min-height: calc(100vh - 128px);
    }
  `]
})
export class AdminLayoutComponent {
  isMobile = signal<boolean>(false);
  // Real implementation would use BreakpointObserver from @angular/cdk/layout
}