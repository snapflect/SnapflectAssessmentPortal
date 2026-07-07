import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardContainerComponent } from './dashboard-container.component';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';

@Component({
  template: `
    <app-dashboard-container>
      <div class="test-content">Projected Content</div>
    </app-dashboard-container>
  `,
  standalone: true,
  imports: [DashboardContainerComponent]
})
class TestHostComponent {}

describe('DashboardContainerComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render breadcrumb and content projection area', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-breadcrumb')).toBeTruthy();
    expect(compiled.querySelector('.dashboard-container')).toBeTruthy();
    expect(compiled.querySelector('.test-content')?.textContent).toContain('Projected Content');
  });
});
