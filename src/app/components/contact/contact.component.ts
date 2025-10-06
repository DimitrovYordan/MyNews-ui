import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { ContactService } from '../../services/contact.service';
import { ModalComponent } from '../../shared/modal/modal.component';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, ModalComponent],
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
    contactForm: FormGroup;
    showModal: boolean = false;
    modalMessage: string = '';
    modalType: 'success' | 'error' = 'success';

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
        private contactService: ContactService,
        private authService: AuthService
    ) {
        this.contactForm = this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(50)]],
            message: ['', [Validators.required, Validators.maxLength(1000)]]
        });
    }

    get title() {
        return this.contactForm.get('title');
    }

    get message() {
        return this.contactForm.get('message');
    }

    sendMessage() {
        if (this.contactForm.invalid) {
            this.contactForm.markAllAsTouched();
            return;
        }

        const currentUser = this.authService.getCurrentUser();
        const userEmail = currentUser?.email || '';

        const payload = {
            title: encodeURIComponent(this.contactForm.value.title),
            message: encodeURIComponent(this.contactForm.value.message),
            fromEmail: userEmail
        };

        this.contactService.sendMessage(payload).subscribe({
            next: () => {
                this.modalMessage = 'The message was sent successfully!';
                this.modalType = 'success';
                this.showModal = true;
                this.contactForm.reset();
            },
            error: () => {
                this.modalMessage = 'An error occurred. Please try again.';
                this.modalType = 'error';
                this.showModal = true
            }
        });
    }

    closeModal() {
        this.showModal = false;
    }
}
