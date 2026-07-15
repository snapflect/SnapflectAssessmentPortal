import { Component, Input, forwardRef, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-multi-select-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectDropdownComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative w-full" (click)="$event.stopPropagation()">
      <div 
        class="input-field flex flex-nowrap gap-2 min-h-[42px] cursor-pointer items-start justify-between !py-1.5"
        (click)="toggleOpen()">
        
        <div class="flex flex-wrap gap-1.5 items-center flex-1 w-0 min-h-[28px]">
          <span *ngIf="selectedItems.length === 0" class="text-muted text-sm py-0.5 truncate">{{ placeholder }}</span>
          
          <span *ngFor="let item of selectedItems" 
                class="bg-brand/10 text-brand-light text-xs px-2 py-1 rounded-md flex items-center gap-1 border border-brand/20 shadow-sm max-w-full">
            <span class="truncate">{{ getLabel(item) }}</span>
            <button type="button" class="hover:text-danger focus:outline-none opacity-60 hover:opacity-100 flex-shrink-0" (click)="removeItem(item, $event)">
              &times;
            </button>
          </span>
        </div>

        <svg class="w-4 h-4 text-muted transition-transform flex-shrink-0 mt-1.5" [class.rotate-180]="isOpen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>

      <div *ngIf="isOpen" 
           class="absolute top-full left-0 w-full mt-1.5 bg-[#161b22] border border-border-light rounded-lg shadow-2xl z-[100] max-h-64 overflow-y-auto custom-scrollbar ring-1 ring-white/5">
        <div *ngFor="let opt of options" 
             class="px-3 py-2.5 text-sm hover:bg-white/10 cursor-pointer flex items-center gap-3 text-main transition-colors border-b border-white/[0.02] last:border-0"
             (click)="toggleItem(opt)">
          <input type="checkbox" [checked]="isSelected(opt)" class="w-4 h-4 rounded bg-black/50 border-white/20 text-brand focus:ring-brand focus:ring-offset-0 cursor-pointer pointer-events-none">
          <span class="flex-1">{{ getLabel(opt) }}</span>
        </div>
        <div *ngIf="options.length === 0" class="px-4 py-6 text-sm text-muted text-center italic">
          No options available.
        </div>
      </div>
    </div>
  `
})
export class MultiSelectDropdownComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() valueKey: string = 'id';
  @Input() labelKey: string = 'name';
  @Input() placeholder: string = 'Select...';
  
  // Optional support for nested object keys like "attributes.tag_name"
  @Input() nestedLabelKey: string = '';

  isOpen = false;
  value: any[] = [];

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.onTouched();
    }
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  get selectedItems() {
    if (!this.options || !this.value) return [];
    return this.options.filter(o => this.value.includes(o[this.valueKey]));
  }

  getLabel(opt: any): string {
    if (this.nestedLabelKey) {
      const keys = this.nestedLabelKey.split('.');
      let val = opt;
      for (const k of keys) {
        if (val) val = val[k];
      }
      return val;
    }
    return opt[this.labelKey];
  }

  isSelected(opt: any): boolean {
    return Array.isArray(this.value) && this.value.includes(opt[this.valueKey]);
  }

  toggleItem(opt: any) {
    if (!Array.isArray(this.value)) {
      this.value = [];
    }
    const val = opt[this.valueKey];
    if (this.isSelected(opt)) {
      this.value = this.value.filter(v => v !== val);
    } else {
      this.value = [...this.value, val];
    }
    this.onChange(this.value);
  }

  removeItem(opt: any, event: Event) {
    event.stopPropagation();
    const val = opt[this.valueKey];
    this.value = this.value.filter(v => v !== val);
    this.onChange(this.value);
  }

  writeValue(val: any): void {
    this.value = Array.isArray(val) ? val : [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
