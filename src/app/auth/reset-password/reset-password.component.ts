import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  token: string = '';
  showPassword: boolean = false;
  showRepeatPassword: boolean = false;
  showModal: boolean = false;
  modalMessage: string = '';
  modalType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)]],
      repeatPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
    
    this.activatedRoute.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const repeat = group.get('repeatPassword')?.value;
    return password === repeat ? null : { passwordsMismatch: true };
  }

  submit(): void {
    if (this.resetForm.valid) {
      this.authService.resetPassword({ token: this.token, newPassword: this.resetForm.value.password }).subscribe({
        next: () => {
          this.modalType = 'success';
          this.modalMessage = 'Password reset successfully!';
          this.showModal = true;
        },
        error: () => {
          this.modalType = 'error';
          this.modalMessage = 'Invalid or expired token.';
          this.showModal = true;
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }

  closeModal() {
    this.showModal = false;
    if (this.modalType === 'success') {
      this.router.navigate(['/login']);
    }
  }
}
