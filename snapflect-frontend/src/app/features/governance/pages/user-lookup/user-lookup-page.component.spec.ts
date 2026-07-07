import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserLookupPageComponent } from './user-lookup-page.component';

describe('UserLookupPageComponent', () => {
  let component: UserLookupPageComponent;
  let fixture: ComponentFixture<UserLookupPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLookupPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserLookupPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize users', () => {
    expect(component).toBeTruthy();
    expect(component.users.length).toBeGreaterThan(0);
  });
});
