import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicationPanelComponent } from './publication-panel.component';
import { By } from '@angular/platform-browser';

describe('PublicationPanelComponent', () => {
  let component: PublicationPanelComponent;
  let fixture: ComponentFixture<PublicationPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationPanelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicationPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display status correctly', () => {
    component.status = 'archived';
    fixture.detectChanges();
    const statusText = fixture.debugElement.query(By.css('.status-indicator')).nativeElement.textContent;
    expect(statusText).toContain('Status: archived');
  });

  it('should show publish button if status is pending and emit when clicked', () => {
    spyOn(component.publish, 'emit');
    component.status = 'pending';
    component.resultId = 'res-1';
    fixture.detectChanges();

    const publishBtn = fixture.debugElement.query(By.css('.publish-btn'));
    expect(publishBtn).toBeTruthy();

    publishBtn.triggerEventHandler('click', null);
    expect(component.publish.emit).toHaveBeenCalledWith('res-1');
  });

  it('should not emit publish if resultId is missing', () => {
    spyOn(component.publish, 'emit');
    component.status = 'pending';
    component.resultId = undefined;
    fixture.detectChanges();

    const publishBtn = fixture.debugElement.query(By.css('.publish-btn'));
    publishBtn.triggerEventHandler('click', null);
    expect(component.publish.emit).not.toHaveBeenCalled();
  });

  it('should show unpublish button if status is published and emit when clicked', () => {
    spyOn(component.unpublish, 'emit');
    component.status = 'published';
    component.resultId = 'res-2';
    fixture.detectChanges();

    const unpublishBtn = fixture.debugElement.query(By.css('.unpublish-btn'));
    expect(unpublishBtn).toBeTruthy();

    unpublishBtn.triggerEventHandler('click', null);
    expect(component.unpublish.emit).toHaveBeenCalledWith('res-2');
  });

  it('should not emit unpublish if resultId is missing', () => {
    spyOn(component.unpublish, 'emit');
    component.status = 'published';
    component.resultId = undefined;
    fixture.detectChanges();

    const unpublishBtn = fixture.debugElement.query(By.css('.unpublish-btn'));
    unpublishBtn.triggerEventHandler('click', null);
    expect(component.unpublish.emit).not.toHaveBeenCalled();
  });
});
