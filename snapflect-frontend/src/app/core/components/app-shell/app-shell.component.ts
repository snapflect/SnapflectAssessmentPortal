import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../shared/stores/auth.store';
import { UserStore } from '../../../shared/stores/user.store';
import { NavigationService } from '../../services/navigation.service';
import { ThemeService } from '../../services/theme.service';
import { AuthFacade } from '../../../features/auth/facades/auth.facade';
import { NotificationDropdownComponent } from '../../../shared/components/notification-dropdown/notification-dropdown.component';
import { NavigationStore } from '../../../shared/stores/navigation.store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, NotificationDropdownComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-page text-main">
      
      <!-- Sidebar -->
      <aside class="w-64 flex-shrink-0 glass-card m-4 mr-0 flex flex-col overflow-hidden">
        <div class="flex-1 flex flex-col min-h-0">
          <div class="h-16 flex-shrink-0 flex items-center px-6 border-b border-white/5">
            <h1 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-accent-light">
              Snapflect
            </h1>
          </div>
          <div class="p-4 border-b border-white/5">
            <button class="w-full flex items-center justify-between bg-input-bg hover:bg-black/40 border border-border-light rounded-lg px-3 py-2 transition-colors">
              <div class="flex items-center text-left flex-1 min-w-0">
                <div class="flex-shrink-0 w-6 h-6 rounded bg-brand/30 text-brand-light flex items-center justify-center font-bold text-xs mr-2">
                  {{ getWorkspaceName().charAt(0) | uppercase }}
                </div>
                <div class="overflow-hidden flex-1 min-w-0">
                  <p class="text-xs text-muted leading-tight">Workspace</p>
                  <p class="text-sm text-main font-medium truncate" [title]="getWorkspaceName()">{{ getWorkspaceName() }}</p>
                </div>
              </div>
            </button>
          </div>
          <nav class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <div *ngFor="let group of navGroups()">
              
              <!-- Group Header (Collapsible) -->
              <button *ngIf="group.name !== 'Home'" 
                      (click)="toggleGroup(group.name)"
                      class="w-full flex items-center justify-between px-2 py-1 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-muted transition-colors">
                <span>{{ group.name }}</span>
                <svg class="w-3 h-3 transition-transform duration-200" 
                     [class.rotate-180]="expandedGroups[group.name] === false"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <!-- Group Links -->
              <div class="space-y-1" [class.hidden]="expandedGroups[group.name] === false">
                <a *ngFor="let link of group.links" 
                   [routerLink]="link.path" 
                   routerLinkActive="bg-white/10 text-brand-light font-medium" 
                   [routerLinkActiveOptions]="{exact: link.path === '/dashboard'}"
                   class="flex items-center px-3 py-2 rounded-lg text-muted hover:brightness-110 hover:text-main transition-colors cursor-pointer text-sm">
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="link.icon"></path>
                  </svg>
                  <span class="flex-1">{{ link.name }}</span>
                  <!-- Notification Badge for Active Sessions -->
                  <span *ngIf="link.name === 'Active Sessions' && badges()['active_sessions'] > 0" 
                        class="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-main bg-red-500 rounded-full">
                    {{ badges()['active_sessions'] }}
                  </span>
                </a>
              </div>
            </div>
          </nav>
        </div>
        
        <!-- User Profile Snippet in Sidebar -->
        <div class="p-4 border-t border-white/5 flex-shrink-0">
          <div class="flex items-center p-3 rounded-lg bg-input-bg">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-accent flex items-center justify-center text-sm font-bold text-main shadow-lg">
              {{ userStore.profile()?.first_name?.charAt(0) }}{{ userStore.profile()?.last_name?.charAt(0) }}
            </div>
            <div class="ml-3 overflow-hidden">
              <p class="text-sm font-medium text-main truncate">{{ userStore.profile()?.first_name }} {{ userStore.profile()?.last_name }}</p>
              <p class="text-xs text-muted truncate">{{ userStore.profile()?.email }}</p>
            </div>
          </div>
          <button (click)="logout()" class="mt-3 w-full btn-secondary text-sm flex justify-center items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden">
        <!-- Top Header -->
        <header class="h-16 flex items-center justify-between px-8 mt-4 mx-4 glass-card relative z-50">
          <div class="flex items-center text-muted text-sm">
            <span>Snapflect Portal</span>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Theme Toggle -->
            <button (click)="themeService.toggleTheme()" class="text-muted hover:text-main transition-colors" title="Toggle Theme">
              <svg *ngIf="themeService.getTheme() === 'dark'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <svg *ngIf="themeService.getTheme() === 'light'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            </button>
            <!-- Notification Bell -->
            <app-notification-dropdown></app-notification-dropdown>
          </div>
        </header>

        <!-- Page Router Outlet -->
        <div class="flex-1 overflow-auto p-4 relative z-0">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class AppShellComponent {
  public authStore = inject(AuthStore);
  public userStore = inject(UserStore);
  public themeService = inject(ThemeService);
  public authFacade = inject(AuthFacade);
  public navService = inject(NavigationService);
  public navStore = inject(NavigationStore);
  public navGroups = this.navService.navGroups;
  public badges = this.navService.badges;
  public expandedGroups: Record<string, boolean> = {};

  toggleGroup(groupName: string) {
    this.expandedGroups[groupName] = !this.expandedGroups[groupName];
  }

  logout() {
    this.navStore.setLoading(true, 'Signing out securely...');
    this.authFacade.logout().subscribe({
      next: () => {
        // the facade handles the redirect, keep loader active
      },
      error: () => {
        this.navStore.setLoading(false);
        this.authStore.clearToken();
        window.location.href = '/auth/login';
      }
    });
  }

  getWorkspaceName(): string {
    const orgName = this.userStore.profile()?.organization_name;
    if (orgName) return orgName;
    
    const roles = this.userStore.profile()?.roles || [];
    if (roles.includes('PLATFORM_ADMIN')) return 'System Admin';
    if (roles.includes('CANDIDATE')) return 'My Workspace';
    return 'Default Workspace';
  }
}
