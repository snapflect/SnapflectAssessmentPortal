import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from './shared/stores/auth.store';
import { UserStore } from './shared/stores/user.store';
import { NavigationService } from './core/services/navigation.service';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';
import { AuthFacade } from './features/auth/facades/auth.facade';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ToastContainerComponent, ConfirmModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'snapflect-frontend';
  public authStore = inject(AuthStore);
  public userStore = inject(UserStore);

  public authFacade = inject(AuthFacade);
  public navService = inject(NavigationService);
  public navGroups = this.navService.navGroups;
  public badges = this.navService.badges;
  public expandedGroups: Record<string, boolean> = {};

  toggleGroup(groupName: string) {
    this.expandedGroups[groupName] = !this.expandedGroups[groupName];
  }
  
  public isLoggingOut = false;

  logout() {
    this.isLoggingOut = true;
    this.authFacade.logout().subscribe({
      next: () => {
        // We do NOT set isLoggingOut = false here!
        // The auth facade will trigger a hard redirect, so we want the loader to stay up until the browser destroys the page.
      },
      error: () => {
        // Fallback if API fails
        this.authStore.clearToken();
        window.location.href = '/auth/login';
      }
    });
  }
}
