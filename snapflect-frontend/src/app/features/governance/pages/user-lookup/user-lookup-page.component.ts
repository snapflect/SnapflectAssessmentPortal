import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-lookup-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col p-6 overflow-y-auto">
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">User Lookup & Support</h2>
          <p class="text-muted text-sm mt-1">Search users to troubleshoot accounts, view activity, or perform support actions.</p>
        </div>
      </div>

      <div class="bg-card flex-1 p-6 border border-border-light shadow-lg rounded-xl flex flex-col min-h-0">
        <div class="flex justify-between items-center mb-6">
           <h3 class="font-bold text-main">Support Directory</h3>
           <div class="bg-input-bg border border-border-light rounded-lg px-4 py-2 flex items-center">
             <svg class="w-4 h-4 text-brand-light mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             <input type="text" placeholder="Search by name or email..." class="bg-transparent border-none focus:outline-none text-sm text-main w-64 placeholder:text-muted">
           </div>
        </div>
        
        <div class="table-responsive flex-1">
          <table class="w-full text-left border-collapse min-w-[800px]">
             <thead class="sticky top-0 bg-card z-10">
               <tr class="bg-input-bg">
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light rounded-tl-lg">User</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Email</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Account Status</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Last Login</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light text-right rounded-tr-lg">Support Actions</th>
               </tr>
             </thead>
             <tbody>
               <tr *ngFor="let user of users" class="border-b border-border-light hover:bg-input-bg transition-colors">
                 <td class="p-4">
                   <div class="text-sm font-medium text-main">{{ user.name }}</div>
                 </td>
                 <td class="p-4 text-sm text-muted">{{ user.email }}</td>
                 <td class="p-4">
                   <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-500">
                     Active
                   </span>
                 </td>
                 <td class="p-4 text-sm text-muted">2 hours ago</td>
                 <td class="p-4 text-right">
                   <div class="flex justify-end gap-2">
                     <button class="text-xs border border-border-light px-2 py-1 rounded hover:bg-white/5 transition-colors text-brand-light">Activity Logs</button>
                     <button class="text-xs border border-border-light px-2 py-1 rounded hover:bg-white/5 transition-colors text-amber-500">Reset Password</button>
                     <button class="text-xs border border-border-light px-2 py-1 rounded hover:bg-white/5 transition-colors text-rose-500">Force Logout</button>
                   </div>
                 </td>
               </tr>
             </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UserLookupPageComponent {
  users = [
    { name: 'Platform Administrator', email: 'admin@snapflect.com' },
    { name: 'Assessment Manager', email: 'assessment_manager@snapflect.com' },
    { name: 'Content Creator', email: 'content_creator@snapflect.com' },
    { name: 'Reviewer User', email: 'reviewer@snapflect.com' },
    { name: 'Candidate User', email: 'candidate@snapflect.com' },
    { name: 'Client Admin', email: 'client_admin@snapflect.com' },
    { name: 'Proctor User', email: 'proctor@snapflect.com' }
  ];
}
