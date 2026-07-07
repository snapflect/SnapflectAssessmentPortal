import { Injectable, inject, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserStore } from '../../shared/stores/user.store';

export interface NavLink {
  name: string;
  path: string;
  icon: string;
  group?: string;
  permissions?: string[]; // If undefined, available to all authenticated users
}

export interface NavGroup {
  name: string;
  links: NavLink[];
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private userStore = inject(UserStore);
  private http = inject(HttpClient);

  public readonly badges = signal<Record<string, number>>({});

  constructor() {
    this.startPollingNavigationConfig();
  }

  private startPollingNavigationConfig() {
    this.fetchNavigationConfig();
    interval(60000).subscribe(() => this.fetchNavigationConfig());
  }

  private fetchNavigationConfig() {
    if (this.userStore.profile()) {
      this.http.get<any>(`${environment.apiUrl}/ui/navigation`).subscribe({
        next: (res) => {
          if (res.data?.badges) {
            this.badges.set(res.data.badges);
          }
        },
        error: (err) => console.error('Failed to fetch navigation config', err)
      });
    }
  }

  // Icon paths
  private icons = {
    dashboard:            'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    organization:         'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    businessUnits:        'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    department:           'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    locations:            'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    users:                'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    questionBanks:        'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    assessments:          'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    publications:         'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    activeSessions:       'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    scoring:              'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    results:              'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    billing:              'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    invoice:              'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z',
    candidateAssessments: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    certificates:         'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    support:              'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
    monitor:              'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  };

  // Master nav list — permissions control visibility
  private allLinks: NavLink[] = [
    // ── Home (all authenticated users) ────────────────────────────────────
    { name: 'Dashboard', path: '/dashboard', icon: this.icons.dashboard, group: 'Home' },

    // ── Governance ────────────────────────────────────────────────────────
    { name: 'Organizations',     path: '/governance/organizations',  icon: this.icons.organization,   group: 'Governance',  permissions: ['Governance.Organizations.View', 'Governance.Organizations.Manage'] },
    { name: 'Business Units',    path: '/governance/business-units', icon: this.icons.businessUnits,  group: 'Governance',  permissions: ['Governance.BusinessUnits.View', 'Governance.BusinessUnits.Manage'] },
    { name: 'Departments',       path: '/governance/departments',    icon: this.icons.department,     group: 'Governance',  permissions: ['Governance.Departments.View', 'Governance.Departments.Manage'] },
    { name: 'Locations',         path: '/governance/locations',      icon: this.icons.locations,      group: 'Governance',  permissions: ['Governance.Locations.View', 'Governance.Locations.Manage'] },
    { name: 'Users',             path: '/governance/users',          icon: this.icons.users,          group: 'Governance',  permissions: ['Security.Users.View', 'Security.Users.Manage'] },
    { name: 'Roles',             path: '/governance/roles',          icon: this.icons.scoring,        group: 'Governance',  permissions: ['Security.Roles.View', 'Security.Roles.Manage'] },
    { name: 'Permissions',       path: '/governance/permissions',    icon: this.icons.billing,        group: 'Governance',  permissions: ['Security.Permissions.View', 'Security.Permissions.Assign'] },

    // ── Billing ───────────────────────────────────────────────────────────
    { name: 'Billing',           path: '/governance/billing',        icon: this.icons.billing,        group: 'Billing', permissions: ['Billing.Invoices.View', 'Billing.Subscription.Manage'] },

    // ── Authoring Studio ─────────────────────────────────────────────────
    { name: 'Authoring Dashboard', path: '/authoring/dashboard',    icon: this.icons.dashboard,      group: 'Authoring',   permissions: ['Assessment.Catalog.View', 'Assessment.Catalog.Manage'] },
    { name: 'Assessment Catalog',path: '/authoring/assessments',     icon: this.icons.assessments,    group: 'Authoring',   permissions: ['Assessment.Catalog.View', 'Assessment.Catalog.Manage'] },
    { name: 'Questions',         path: '/authoring/questions',       icon: this.icons.assessments,    group: 'Authoring',   permissions: ['Assessment.Questions.View', 'Assessment.Questions.Create'] },
    { name: 'Question Banks',    path: '/authoring/question-banks',  icon: this.icons.questionBanks,  group: 'Authoring',   permissions: ['Assessment.QuestionBanks.View', 'Assessment.QuestionBanks.Manage'] },
    { name: 'Question Tags',     path: '/authoring/question-tags',   icon: this.icons.assessments,    group: 'Authoring',   permissions: ['Assessment.Metadata.View', 'Assessment.Metadata.Manage'] }, // M-1 Fix: Taxonomy admin — restricted to CLIENT_ADMIN+ only
    { name: 'Competencies',      path: '/authoring/competencies',    icon: this.icons.results,        group: 'Authoring',   permissions: ['Assessment.Competencies.View', 'Assessment.Competencies.Manage'] },
    { name: 'Categories',        path: '/authoring/categories',      icon: this.icons.assessments,    group: 'Authoring',   permissions: ['Assessment.Metadata.View', 'Assessment.Metadata.Manage'] }, // M-2 Fix: System-level metadata — restricted to CLIENT_ADMIN+ only
    { name: 'Types',             path: '/authoring/types',           icon: this.icons.assessments,    group: 'Authoring',   permissions: ['Assessment.Metadata.View', 'Assessment.Metadata.Manage'] }, // M-3 Fix: System-level metadata — restricted to CLIENT_ADMIN+ only
    { name: 'Blueprint Designer',path: '/authoring/blueprints',      icon: this.icons.candidateAssessments, group: 'Authoring', permissions: ['Assessment.Blueprints.View', 'Assessment.Blueprints.Manage'] },
    { name: 'Publications',      path: '/authoring/publications',    icon: this.icons.publications,   group: 'Authoring',   permissions: ['Assessment.Publications.View', 'Assessment.Publications.Manage'] },

    // ── Delivery & Scoring ────────────────────────────────────────────────
    { name: 'Reviewer Dashboard',path: '/results/reviewer-dashboard',icon: this.icons.dashboard,      group: 'Delivery',    permissions: ['Results.ManualScoring.Score'] }, // H-1: Filtered separately for AM in navGroups computed
    { name: 'Active Sessions',   path: '/delivery/proctoring',       icon: this.icons.activeSessions, group: 'Delivery',    permissions: ['Delivery.Sessions.View', 'Delivery.Sessions.Proctor', 'Delivery.Sessions.Terminate'] },
    { name: 'Session Management',path: '/delivery/sessions',         icon: this.icons.activeSessions, group: 'Delivery',    permissions: ['Delivery.Sessions.View', 'Delivery.Sessions.Proctor', 'Delivery.Sessions.Terminate'] }, // H-2 Fix: Corrected guard — delivery/ops permission, not publish permission
    { name: 'Manual Scoring',    path: '/scoring/manual',            icon: this.icons.scoring,        group: 'Delivery',    permissions: ['Results.ManualScoring.Score'] },

    // ── Analytics ─────────────────────────────────────────────────────────
    { name: 'Analytics & Results',path: '/results/analytics',        icon: this.icons.results,        group: 'Analytics',   permissions: ['Results.Analytics.View', 'Results.Analytics.Export'] },

    // ── Support Tools ─────────────────────────────────────────────────────
    { name: 'Ticket Queue',      path: '/support/tickets',           icon: this.icons.support,        group: 'Support Desk',permissions: ['Support.Tickets.View', 'Support.Tickets.Manage'] },
    { name: 'User Lookup',       path: '/governance/user-lookup',    icon: this.icons.users,          group: 'Support Desk',permissions: ['Security.Users.View'] },
    { name: 'Session Monitor',   path: '/delivery/monitor',          icon: this.icons.monitor,        group: 'Support Desk',permissions: ['Delivery.Sessions.View', 'Delivery.Sessions.Proctor'] },

    // ── Learner Portal (CANDIDATE) ────────────────────────────────────────
    { name: 'My Assessments',    path: '/delivery/dashboard',        icon: this.icons.candidateAssessments, group: 'Learner Portal', permissions: ['Delivery.MyAssessments.Take'] },
    { name: 'My Results',        path: '/results/candidate',         icon: this.icons.certificates,         group: 'Learner Portal', permissions: ['Results.MyResults.View'] },
    
    // ── Help & Support ────────────────────────────────────────────────────
    { name: 'My Tickets',        path: '/support/tickets',           icon: this.icons.support,        group: 'Help & Support', permissions: ['Support.Tickets.Create'] },
  ];

  public navGroups = computed<NavGroup[]>(() => {
    const profile = this.userStore.profile();

    // For pure CANDIDATE: hide Admin groups
    // For pure CONTENT_CREATOR: hide global dashboard link in favor of Authoring Dashboard
    const isOnlyCandidate = profile?.roles?.length === 1 && profile.roles[0] === 'CANDIDATE';
    const isOnlyContentCreator = profile?.roles?.length === 1 && profile.roles[0] === 'CONTENT_CREATOR';
    const isOnlyReviewer = profile?.roles?.length === 1 && profile.roles[0] === 'REVIEWER';
    const isOnlyAssessmentManager = profile?.roles?.length === 1 && profile.roles[0] === 'ASSESSMENT_MANAGER';
    const isOnlyProctor = profile?.roles?.length === 1 && profile.roles[0] === 'PROCTOR';
    const adminOnlyGroups = ['Governance', 'Authoring', 'Delivery', 'Analytics', 'Billing', 'Support Desk'];

    const allowedLinks = this.allLinks.filter(link => {
      // Hide global Dashboard for pure Content Creators, Reviewers, Assessment Managers, and Proctors
      if (link.name === 'Dashboard' && (isOnlyContentCreator || isOnlyReviewer || isOnlyAssessmentManager || isOnlyProctor)) {
        return false;
      }
      if (link.name === 'Billing' && this.userStore.hasAnyRole(['PLATFORM_ADMIN'])) {
        return false;
      }
      // H-1 Fix: Reviewer Dashboard is a task-queue for Reviewers only.
      // Assessment Manager shares Results.ManualScoring.Score but should NOT see this item.
      if (link.name === 'Reviewer Dashboard' && isOnlyAssessmentManager) {
        return false;
      }
      if (link.name === 'My Tickets' && this.userStore.hasAnyPermission(['Support.Tickets.View'])) {
        // Hide "My Tickets" if they already have access to the full "Ticket Queue"
        return false;
      }
      if ((link.group === 'Support Desk' || link.group === 'Help & Support') && this.userStore.hasAnyRole(['READ_ONLY'])) {
        // Hide all Support-related menus for READ_ONLY users. 
        // Even though they have Security.Users.View (which allows User Lookup), they shouldn't see Support Desk.
        return false;
      }
      if (!link.permissions || link.permissions.length === 0) return true; // no restriction
      return this.userStore.hasAnyPermission(link.permissions);
    });

    const groupsMap = new Map<string, NavLink[]>();
    const groupOrder = ['Home', 'Governance', 'Billing', 'Authoring', 'Delivery', 'Analytics', 'Support Desk', 'Learner Portal', 'Help & Support'];

    allowedLinks.forEach(link => {
      const g = link.group || 'Other';
      if (!groupsMap.has(g)) groupsMap.set(g, []);
      groupsMap.get(g)!.push(link);
    });

    // Deduplicate links within each group (e.g. Invoices + Subscriptions both pointing to billing)
    groupsMap.forEach((links, g) => {
      const seen = new Set<string>();
      groupsMap.set(g, links.filter(l => {
        const key = l.name + l.path;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }));
    });

    const result: NavGroup[] = [];
    groupOrder.forEach(g => {
      if (isOnlyCandidate && adminOnlyGroups.includes(g)) return; // hide admin groups for pure candidates
      if (groupsMap.has(g) && groupsMap.get(g)!.length > 0) {
        result.push({ name: g, links: groupsMap.get(g)! });
      }
    });

    // Catch-all for unlisted groups
    groupsMap.forEach((links, g) => {
      if (!groupOrder.includes(g)) result.push({ name: g, links });
    });

    return result;
  });
}
