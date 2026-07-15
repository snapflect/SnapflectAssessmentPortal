import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimAccountComponent } from './claim-account.component';

describe('ClaimAccountComponent', () => {
  let component: ClaimAccountComponent;
  let fixture: ComponentFixture<ClaimAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimAccountComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

