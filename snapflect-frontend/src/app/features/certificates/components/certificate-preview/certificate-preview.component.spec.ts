import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CertificatePreviewComponent } from './certificate-preview.component';

describe('CertificatePreviewComponent', () => {
  let component: CertificatePreviewComponent;
  let fixture: ComponentFixture<CertificatePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificatePreviewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CertificatePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});