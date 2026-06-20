const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect-frontend', 'src', 'app');

const dirs = [
    'layout/auth-layout',
    'layout/admin-layout',
    'layout/candidate-layout',
    'shared/components/topbar',
    'shared/components/sidebar',
    'shared/components/footer',
    'shared/components/breadcrumb',
    'shared/components/notification-panel',
    'layout/navigation/admin-navigation',
    'layout/navigation/candidate-navigation',
    'layout/dashboard-shell/dashboard-container',
    'layout/dashboard-shell/dashboard-content'
];

dirs.forEach(d => {
    fs.mkdirSync(path.join(baseDir, d), { recursive: true });
});

const writeTsFile = (relativePath, content) => {
    fs.writeFileSync(path.join(baseDir, relativePath), content.trim());
};

// --- LAYOUTS ---

writeTsFile('layout/auth-layout/auth-layout.component.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: \`
    <div class="auth-layout-container">
      <div class="auth-content-wrapper">
        <router-outlet></router-outlet>
      </div>
    </div>
  \`,
  styles: [\`
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
  \`]
})
export class AuthLayoutComponent {}
`);

writeTsFile('layout/admin-layout/admin-layout.component.ts', `
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
  template: \`
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
  \`,
  styles: [\`
    .admin-layout-container {
      height: 100vh;
      font-family: 'Inter', sans-serif;
    }
    .main-content {
      padding: 24px;
      min-height: calc(100vh - 128px);
    }
  \`]
})
export class AdminLayoutComponent {
  isMobile = signal<boolean>(false);
  // Real implementation would use BreakpointObserver from @angular/cdk/layout
}
`);

writeTsFile('layout/candidate-layout/candidate-layout.component.ts', `
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
  template: \`
    <div class="candidate-layout-container">
      <app-topbar>
        <app-candidate-navigation></app-candidate-navigation>
      </app-topbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  \`,
  styles: [\`
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
  \`]
})
export class CandidateLayoutComponent {}
`);

// --- SHARED COMPONENTS ---

writeTsFile('shared/components/topbar/topbar.component.ts', `
import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, NotificationPanelComponent],
  template: \`
    <mat-toolbar color="primary" class="topbar">
      <button mat-icon-button (click)="toggleMenu.emit()" class="menu-button">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="brand">Snapflect</span>
      <span class="spacer"></span>
      <ng-content></ng-content>
      <app-notification-panel></app-notification-panel>
      <button mat-icon-button>
        <mat-icon>account_circle</mat-icon>
      </button>
    </mat-toolbar>
  \`,
  styles: [\`
    .topbar { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .spacer { flex: 1 1 auto; }
    .menu-button { margin-right: 16px; }
    .brand { font-weight: 600; letter-spacing: 0.5px; }
  \`]
})
export class TopbarComponent {
  toggleMenu = output<void>();
}
`);

writeTsFile('shared/components/sidebar/sidebar.component.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="assets/logo.svg" alt="Logo" class="logo" *ngIf="false" />
      </div>
      <ng-content></ng-content>
    </aside>
  \`,
  styles: [\`
    .sidebar { width: 260px; height: 100%; background: #ffffff; border-right: 1px solid #e0e0e0; }
    .sidebar-header { padding: 16px; border-bottom: 1px solid #e0e0e0; }
  \`]
})
export class SidebarComponent {}
`);

writeTsFile('shared/components/footer/footer.component.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <footer class="footer">
      <p>&copy; 2026 Snapflect Assessment Portal. All rights reserved.</p>
    </footer>
  \`,
  styles: [\`
    .footer { padding: 16px; text-align: center; color: #757575; font-size: 0.875rem; border-top: 1px solid #e0e0e0; }
  \`]
})
export class FooterComponent {}
`);

writeTsFile('shared/components/breadcrumb/breadcrumb.component.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: \`
    <nav class="breadcrumb">
      <ol>
        <li><a routerLink="/">Home</a></li>
        <li class="separator"><mat-icon>chevron_right</mat-icon></li>
        <li class="current">Current Page</li>
      </ol>
    </nav>
  \`,
  styles: [\`
    .breadcrumb ol { list-style: none; display: flex; align-items: center; padding: 0; margin: 0 0 16px 0; font-size: 0.875rem; }
    .breadcrumb li { display: flex; align-items: center; }
    .breadcrumb a { color: #1976d2; text-decoration: none; }
    .breadcrumb .separator mat-icon { font-size: 1rem; width: 1rem; height: 1rem; margin: 0 4px; color: #9e9e9e; }
    .breadcrumb .current { color: #757575; font-weight: 500; }
  \`]
})
export class BreadcrumbComponent {}
`);

writeTsFile('shared/components/notification-panel/notification-panel.component.ts', `
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatBadgeModule, MatMenuModule],
  template: \`
    <button mat-icon-button [matMenuTriggerFor]="notificationsMenu">
      <mat-icon [matBadge]="unreadCount()" matBadgeColor="warn" [matBadgeHidden]="unreadCount() === 0">notifications</mat-icon>
    </button>
    <mat-menu #notificationsMenu="matMenu">
      <button mat-menu-item>
        <mat-icon>info</mat-icon>
        <span>No new notifications</span>
      </button>
    </mat-menu>
  \`
})
export class NotificationPanelComponent {
  unreadCount = signal(3);
}
`);

// --- NAVIGATION COMPONENTS ---

writeTsFile('layout/navigation/admin-navigation/admin-navigation.component.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: \`
    <mat-nav-list>
      <div class="nav-section">PLATFORM ADMIN</div>
      <a mat-list-item routerLink="/admin/organizations"><mat-icon matListItemIcon>business</mat-icon><div matListItemTitle>Organizations</div></a>
      <a mat-list-item routerLink="/admin/users"><mat-icon matListItemIcon>people</mat-icon><div matListItemTitle>Users</div></a>
      
      <div class="nav-section">ORGANIZATION ADMIN</div>
      <a mat-list-item routerLink="/admin/assessments"><mat-icon matListItemIcon>assignment</mat-icon><div matListItemTitle>Assessments</div></a>
      <a mat-list-item routerLink="/admin/results"><mat-icon matListItemIcon>bar_chart</mat-icon><div matListItemTitle>Results</div></a>
      
      <div class="nav-section">EVALUATOR</div>
      <a mat-list-item routerLink="/admin/reviews"><mat-icon matListItemIcon>rate_review</mat-icon><div matListItemTitle>Manual Reviews</div></a>
    </mat-nav-list>
  \`,
  styles: [\`
    .nav-section { padding: 16px 16px 8px; font-size: 0.75rem; font-weight: 600; color: #9e9e9e; letter-spacing: 1px; }
  \`]
})
export class AdminNavigationComponent {}
`);

writeTsFile('layout/navigation/candidate-navigation/candidate-navigation.component.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-candidate-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: \`
    <nav class="candidate-nav">
      <button mat-button routerLink="/candidate/dashboard">Dashboard</button>
      <button mat-button routerLink="/candidate/assessments">My Assessments</button>
      <button mat-button routerLink="/candidate/results">My Results</button>
    </nav>
  \`,
  styles: [\`
    .candidate-nav { display: flex; gap: 8px; }
  \`]
})
export class CandidateNavigationComponent {}
`);

// --- DASHBOARD SHELL COMPONENTS ---

writeTsFile('layout/dashboard-shell/dashboard-container/dashboard-container.component.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  template: \`
    <div class="dashboard-container">
      <app-breadcrumb></app-breadcrumb>
      <ng-content></ng-content>
    </div>
  \`,
  styles: [\`
    .dashboard-container { padding: 16px 0; }
  \`]
})
export class DashboardContainerComponent {}
`);

writeTsFile('layout/dashboard-shell/dashboard-content/dashboard-content.component.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard-content',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: \`
    <mat-card class="dashboard-content-card">
      <mat-card-content>
        <ng-content></ng-content>
      </mat-card-content>
    </mat-card>
  \`,
  styles: [\`
    .dashboard-content-card { margin-top: 16px; border-radius: 12px; }
  \`]
})
export class DashboardContentComponent {}
`);

console.log('Sprint 05 Phase 2 Layout Framework generated successfully.');
