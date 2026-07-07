import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportExportPanelComponent } from './report-export-panel.component';

describe('ReportExportPanelComponent', () => {
  let component: ReportExportPanelComponent;
  let fixture: ComponentFixture<ReportExportPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportExportPanelComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ReportExportPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit exportCsv event when onExportCsv is called', () => {
    spyOn(component.exportCsv, 'emit');
    component.onExportCsv();
    expect(component.exportCsv.emit).toHaveBeenCalled();
  });

  it('should emit exportPdf event when onExportPdf is called', () => {
    spyOn(component.exportPdf, 'emit');
    component.onExportPdf();
    expect(component.exportPdf.emit).toHaveBeenCalled();
  });

  it('should trigger onExportCsv when Export CSV button is clicked', () => {
    spyOn(component, 'onExportCsv');
    const button = fixture.debugElement.nativeElement.querySelector('button.bg-brand');
    button.click();
    expect(component.onExportCsv).toHaveBeenCalled();
  });

  it('should trigger onExportPdf when Export PDF button is clicked', () => {
    spyOn(component, 'onExportPdf');
    const button = fixture.debugElement.nativeElement.querySelector('button.bg-white');
    button.click();
    expect(component.onExportPdf).toHaveBeenCalled();
  });
});
