import { Injectable, inject } from '@angular/core';
import { GovernanceApiService } from '../../../core/api/governance-api.service';
import { GovernanceStore } from '../../../shared/stores/governance.store';
import { OrganizationStore } from '../../../shared/stores/organization.store';
import { tap } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class GovernanceFacade {
  private api = inject(GovernanceApiService);
  private store = inject(GovernanceStore);
  private orgStore = inject(OrganizationStore);
  public loadOrganizations() { return this.api.getOrganizations().pipe(tap(res => this.orgStore.setOrganizations(res.data))); }
  public loadDepartments() { return this.api.getDepartments().pipe(tap(res => this.store.setDepartments(res.data))); }
  public loadRoles() { return this.api.getRoles().pipe(tap(res => this.store.setRoles(res.data))); }
  public loadPermissions() { return this.api.getPermissions().pipe(tap(res => this.store.setPermissions(res.data))); }
  public loadUsers() { return this.api.getUsers().pipe(tap(res => this.store.setUsers(res.data))); }
}