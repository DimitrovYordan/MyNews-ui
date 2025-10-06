import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;

  showModal: boolean = false;
  modalMessage: string = '';
  modalType: 'success' | 'error' = 'success';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;

      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.showModal = true;
          this.modalType = 'success';
          this.modalMessage = 'Password reset email sent.';
          this.forgotPasswordForm.reset();
          this.forgotPasswordForm.markAsPristine();
          this.forgotPasswordForm.markAsUntouched();
        },
        error: () => {
          this.showModal = true;
          this.modalType = 'error';
          this.modalMessage = 'Failed to send password email.';
        },
      });
    }
  }

  closeModal() {
    this.showModal = false;
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
