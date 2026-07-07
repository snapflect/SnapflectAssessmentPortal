import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlueprintDesignerPageComponent } from './blueprint-designer-page.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../../environments/environment';

describe('BlueprintDesignerPageComponent', () => {
  let component: BlueprintDesignerPageComponent;
  let fixture: ComponentFixture<BlueprintDesignerPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlueprintDesignerPageComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => 'test-uuid' } } }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlueprintDesignerPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should initialize and load blueprints, competencies, tags, and banks', () => {
    const reqBlueprints = httpMock.expectOne(`${environment.apiUrl}/assessment/blueprints?include=assessment,sections.rules.competency,sections.rules.tag&per_page=100`);
    expect(reqBlueprints.request.method).toBe('GET');
    reqBlueprints.flush({ data: [{ uuid: 'bp1', relationships: { assessment: { uuid: 'test-uuid' } } }] });

    const reqComp = httpMock.expectOne(`${environment.apiUrl}/assessment/competencies?per_page=100`);
    reqComp.flush({ data: [] });

    const reqTags = httpMock.expectOne(`${environment.apiUrl}/assessment/tags`);
    reqTags.flush({ data: [] });

    const reqBanks = httpMock.expectOne(`${environment.apiUrl}/assessment/question-banks?per_page=100`);
    reqBanks.flush({ data: [] });

    expect(component.blueprints.length).toBe(1);
    expect(component.activeBlueprintUuid).toBe('bp1');
  });
});
