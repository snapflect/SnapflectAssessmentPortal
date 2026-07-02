import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col p-6 overflow-y-auto">
      
      <div class="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Subscription Details</h2>
          <p class="text-muted text-sm mt-1">Manage your Snapflect Enterprise subscription and usage.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- Plan Details -->
        <div class="bg-card p-6 lg:col-span-2 flex flex-col md:flex-row gap-6 relative overflow-hidden border border-border-light shadow-lg rounded-xl">
           <div class="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

           <div class="flex-1 z-10">
              <div class="inline-block bg-brand/20 text-brand-light font-bold text-xs px-2 py-1 rounded mb-4 uppercase tracking-wider">Current Plan</div>
              <h3 class="text-3xl font-bold text-main mb-1">Enterprise Annual</h3>
              <p class="text-muted text-sm mb-6">Renews automatically on <span class="text-main font-semibold">Jan 1, 2027</span>.</p>
              
              <div class="flex items-end gap-2 mb-6">
                 <span class="text-5xl font-bold text-main">$12,000</span>
                 <span class="text-muted mb-1">/ year</span>
              </div>
              
              <div class="flex gap-4">
                 <button class="bg-brand text-white px-5 py-2.5 rounded-md font-semibold hover:bg-brand-dark transition-colors shadow-lg shadow-brand/25">
                   Change Plan
                 </button>
                 <button class="border border-border text-main px-5 py-2.5 rounded-md font-semibold hover:bg-input-bg transition-colors">
                   Cancel Subscription
                 </button>
              </div>
           </div>

           <!-- Payment Method -->
           <div class="flex-1 md:border-l border-border-light md:pl-6 z-10">
              <h4 class="font-bold text-main mb-4">Payment Method</h4>
              <div class="bg-input-bg border border-border-light rounded-lg p-4 flex items-center justify-between">
                 <div class="flex items-center gap-4">
                    <div class="bg-slate-800 p-2 rounded">
                       <svg class="w-8 h-8 text-white" viewBox="0 0 36 24" fill="none"><rect width="36" height="24" rx="4" fill="#141414"/><path d="M12.922 17.584H11.23l1.045-6.61h1.691l-1.044 6.61zm4.845-6.52c-.11-.048-.56-.164-1.258-.164-1.378 0-2.348.74-2.368 1.802-.02 1.01 1.002 1.545 1.704 1.884.73.35 1.043.6 1.043.953-.02.544-.653.79-1.256.79-.838 0-1.282-.128-1.954-.42l-.274-.127-.243 1.53c.478.221 1.353.407 2.26.417 1.48 0 2.43-.73 2.45-1.85.02-.82-.55-1.44-1.63-1.94-.65-.32-1.05-.53-1.05-.85.02-.3.35-.61.94-.61.64 0 1.09.13 1.4.26l.16.07.25-1.57zm6.757 6.43h1.56l-2.61-6.6h-1.67c-.3 0-.55.18-.65.45l-3.05 7.15h1.76l.35-.97h2.15l.2 1.13zm-.68-2.38h-1.3l.63-1.74c.2-.56.32-1 .4-1.38.07.4.15.82.26 1.36l.28.98l-.27.78zM10.283 11.08l-1.02 6.5h-1.6l.64-4.04l-2.22 4.04h-1.55l-.47-6.5h1.63l.23 4.1.06 1.07 1.94-3.56.08-.2 1.25-.01.07-1.39z" fill="#fff"/></svg>
                    </div>
                    <div>
                       <p class="text-main font-medium text-sm mb-0.5">Visa ending in 4242</p>
                       <p class="text-muted text-xs">Expires 12/28</p>
                    </div>
                 </div>
                 <button class="text-brand-light text-sm hover:underline">Edit</button>
              </div>
           </div>
        </div>
        
        <!-- Usage -->
        <div class="bg-card p-6 flex flex-col justify-between border border-border-light shadow-lg rounded-xl">
           <div>
              <h3 class="font-bold text-main mb-1">Assessment Usage</h3>
              <p class="text-muted text-sm mb-4">You're currently using 85% of your included assessments.</p>
           </div>
           
           <div>
             <div class="flex justify-between items-end mb-2">
               <span class="text-3xl font-bold text-main">8,500</span>
               <span class="text-sm text-muted mb-1">/ 10,000</span>
             </div>
             <div class="w-full h-2.5 bg-input-bg rounded-full overflow-hidden">
               <div class="bg-amber-500 h-full rounded-full w-[85%]"></div>
             </div>
             <p class="text-xs text-muted mt-3">Need more? <a href="#" class="text-brand hover:underline">Purchase Add-on</a></p>
           </div>
        </div>
      </div>
    </div>
  `
})
export class SubscriptionPageComponent {
}
