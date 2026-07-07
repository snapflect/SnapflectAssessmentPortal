import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LocationCreatePageComponent } from './location-create-page.component';

// Mock Services
class MockToastService {
  success() {}
  error() {}
}

class MockConfirmService {
  confirm() { return Promise.resolve(true); }
}

class MockUserStore {
  hasAnyRole() { return true; }
}

describe('LocationCreatePageComponent', () => {
  let component: LocationCreatePageComponent;
  let fixture: ComponentFixture<LocationCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LocationCreatePageComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        FormsModule
      ],
      // Provide generic mocks for commonly injected services
      providers: [
        { provide: 'ToastService', useValue: new MockToastService() },
        { provide: 'ConfirmService', useValue: new MockConfirmService() },
        { provide: 'UserStore', useValue: new MockUserStore() }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
