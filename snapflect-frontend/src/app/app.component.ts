import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from './shared/stores/auth.store';
import { UserStore } from './shared/stores/user.store';
import { NavigationService } from './core/services/navigation.service';
import { ThemeService } from './core/services/theme.service';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';
import { AuthFacade } from './features/auth/facades/auth.facade';
import { NavigationStore } from './shared/stores/navigation.store';

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
}
