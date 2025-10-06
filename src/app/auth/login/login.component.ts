import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  errorMessage: string | null = null;
  loading: boolean = false;
  showPassword: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = null;
    });
  }

  submitLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = null;
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/news']);
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
    });
  }

  triggerForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  closeLogin() {
    this.router.navigate(['/']);
  }
}
