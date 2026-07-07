import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationDropdownComponent } from './notification-dropdown.component';
import { NotificationService } from '../../../core/services/notification.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

class MockNotificationService {
  unreadCount = signal(1);
  notifications = signal([{ id: '1', data: { message: 'Test Notif' }, created_at: new Date().toISOString(), read_at: null }]);
  fetchNotifications = jasmine.createSpy().and.returnValue(of([]));
  markAsRead = jasmine.createSpy().and.returnValue(of(true));
  markAllAsRead = jasmine.createSpy().and.returnValue(of(true));
}

describe('NotificationDropdownComponent', () => {
  let component: NotificationDropdownComponent;
  let fixture: ComponentFixture<NotificationDropdownComponent>;
  let notificationService: MockNotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationDropdownComponent],
      providers: [
        provideRouter([]),
        { provide: NotificationService, useClass: MockNotificationService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationDropdownComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService) as unknown as MockNotificationService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle dropdown and fetch notifications if empty', () => {
    notificationService.notifications.set([]);
    component.toggleDropdown();
    expect(component.isOpen).toBeTrue();
    expect(notificationService.fetchNotifications).toHaveBeenCalled();
  });

  it('should toggle dropdown but not fetch if notifications exist', () => {
    component.toggleDropdown();
    expect(component.isOpen).toBeTrue();
    expect(notificationService.fetchNotifications).not.toHaveBeenCalled();
  });

  it('should mark as read', () => {
    component.markAsRead('1');
    expect(notificationService.markAsRead).toHaveBeenCalledWith('1');
  });

  it('should mark all as read', () => {
    component.markAllAsRead();
    expect(notificationService.markAllAsRead).toHaveBeenCalled();
  });

  it('should close dropdown on outside click', () => {
    component.isOpen = true;
    component.clickout({ target: document.body } as any);
    expect(component.isOpen).toBeFalse();
  });
});
