import { Component, EventEmitter, Output } from "@angular/core";
import { Router } from "@angular/router";

import { UserService } from "../../services/user.service";
import { ModalComponent } from "../../shared/modal/modal.component";
import { AuthService } from "../../services/auth.service";

@Component({
    selector: 'app-delete-account',
    standalone: true,
    imports: [ModalComponent],
    templateUrl: './delete-account.component.html',
    styleUrls: ['./delete-account.component.scss']
})
export class DeleteAccountComponent {
    @Output() closed = new EventEmitter<void>();

    showConfirm = false;

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private router: Router
    ) { }

    openConfirm() {
        this.showConfirm = true;
    }

    closeConfirm(confirmed: boolean) {
        this.showConfirm = false;
        if (confirmed) {
            this.deleteAccount();
        }
    }

    deleteAccount() {
        this.userService.deleteAccount().subscribe({
            next: () => {
                this.authService.isLoggedIn$.next(false);
                this.authService.hasSelectedSections$.next(false);
                this.authService.currentUser$.next(null);

                sessionStorage.clear();

                this.router.navigate(['/'], { replaceUrl: true });
            },
            error: (err) => {
                console.error(err);
            }
        });
    }
}