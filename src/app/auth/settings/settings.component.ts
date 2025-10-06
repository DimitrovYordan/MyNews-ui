import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { DeleteAccountComponent } from '../delete-account/delete-account.component';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [DeleteAccountComponent, ModalComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  settingsForm!: FormGroup;
  showPassword: boolean = false;
  showRepeatPassword: boolean = false;
  showModal: boolean = false;
  modalMessage: string = '';
  modalType: 'success' | 'error' = 'success';

  selectedSection: 'edit' | 'delete' = 'edit';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router) {
    this.settingsForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      country: [''],
      city: [''],
      email: ['', [Validators.email]],
      password: ['', [Validators.minLength(6), Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)]],
      repeatPassword: ['']
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const repeatPassword = group.get('repeatPassword')?.value;

    if (!password && !repeatPassword) return null;

    return password === repeatPassword ? null : { passwordsMismatch: true };
  }

  submitSettings(): void {
    if (this.settingsForm.valid) {
      this.userService.updateProfile(this.settingsForm.value).subscribe({
        next: (updatedFromServer) => {
          const currentUser = this.authService.getCurrentUser();
          if (!currentUser) {
            return;
          }

          const updatedUser = {
            ...currentUser,
            firstName: this.settingsForm.value.firstName || currentUser.firstName,
            lastName: this.settingsForm.value.lastName || currentUser.lastName,
            country: this.settingsForm.value.country || currentUser.country,
            city: this.settingsForm.value.city || currentUser.city,
          };

          this.authService.setCurrentUser(updatedUser);

          this.modalMessage = 'Profile updated successfully!';
          this.modalType = 'success';
          this.showModal = true;
          
          this.settingsForm.reset();
        },
        error: (err) => {
          this.modalMessage = 'Error updating profile.';
          this.modalType = 'error';
          this.showModal = true;
        }
      });
    }
  }

  deleteAccount(): void {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    this.userService.deleteAccount().subscribe({
      next: (res) => {
        sessionStorage.clear();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert('An error occurred while deleting your account.');
      }
    });
  }

  closeModal() {
    this.showModal = false;
  }

  selectSection(section: 'edit' | 'delete') {
    this.selectedSection = section;
  }

  goBack(): void {
    window.history.back();
  }
}