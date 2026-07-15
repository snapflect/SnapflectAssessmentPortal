import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacade } from '../../facades/auth.facade';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-claim-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './claim-account.component.html',
  styleUrls: ['./claim-account.component.scss']
})
export class ClaimAccountComponent implements OnInit {
  claimForm: FormGroup;
  token: string = '';
  email: string = '';
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authFacade: AuthFacade,
    private toastService: ToastService
  ) {
    this.claimForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(100)]],
      last_name: ['', [Validators.required, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('password_confirmation')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.claimForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      ...this.claimForm.value,
      email: this.email,
      token: this.token
    };

    this.authFacade.claimAccount(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success('Account Claimed', 'Welcome to Snapflect!');
        // Note: The AuthFacade handles navigating to the default route (/dashboard) automatically
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to claim account. The token may be expired or invalid.';
        this.toastService.error('Error', this.errorMessage);
      }
    });
  }
}
