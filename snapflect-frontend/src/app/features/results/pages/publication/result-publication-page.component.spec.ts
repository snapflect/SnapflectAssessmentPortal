import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultPublicationPageComponent } from './result-publication-page.component';

describe('ResultPublicationPageComponent', () => {
  let component: ResultPublicationPageComponent;
  let fixture: ComponentFixture<ResultPublicationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultPublicationPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultPublicationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
