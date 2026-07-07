import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BusinessUnitEditPageComponent } from './business-unit-edit-page.component';

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

describe('BusinessUnitEditPageComponent', () => {
  let component: BusinessUnitEditPageComponent;
  let fixture: ComponentFixture<BusinessUnitEditPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BusinessUnitEditPageComponent,
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

    fixture = TestBed.createComponent(BusinessUnitEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
