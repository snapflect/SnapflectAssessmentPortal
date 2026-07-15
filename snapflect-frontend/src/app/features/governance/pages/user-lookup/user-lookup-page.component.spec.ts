import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserLookupPageComponent } from './user-lookup-page.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../../../../environments/environment';

describe('UserLookupPageComponent', () => {
  let component: UserLookupPageComponent;
  let fixture: ComponentFixture<UserLookupPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLookupPageComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UserLookupPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and initialize users', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/security/users`);
    req.flush({ data: [{ id: 1, attributes: { first_name: 'Test' } }] });

    expect(component).toBeTruthy();
    expect(component.users.length).toBeGreaterThan(0);
  });
});
