import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-publication-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="publication-panel">
      <div class="status-indicator">Status: {{ status }}</div>
      <button class="publish-btn" *ngIf="status === 'pending'" (click)="onPublish()">Publish</button>
      <button class="unpublish-btn" *ngIf="status === 'published'" (click)="onUnpublish()">Unpublish</button>
    </div>
  `
})
export class PublicationPanelComponent {
  @Input() resultId?: string;
  @Input() status: 'pending' | 'published' | 'archived' = 'pending';
  @Output() publish = new EventEmitter<string>();
  @Output() unpublish = new EventEmitter<string>();

  onPublish() {
    if (this.resultId) {
      this.publish.emit(this.resultId);
    }
  }

  onUnpublish() {
    if (this.resultId) {
      this.unpublish.emit(this.resultId);
    }
  }
}