import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

import { SectionService } from "../../services/section.service";
import { UserSectionService } from "../../services/user-section.service";
import { Section } from "../../interfaces/section";
import { SectionsNamesUtilsService } from "../../shared/sections-names-utils.service";
import { ModalComponent } from "../../shared/modal/modal.component";

@Component({
    selector: 'app-section-select',
    standalone: true,
    imports: [CommonModule, ModalComponent],
    templateUrl: './section-select.component.html',
    styleUrls: ['section-select.component.scss'],
})
export class SectionSelectComponent implements OnInit {
    sections: Section[] = [];
    selectedSections: number[] = [];
    showSections: boolean = true;
    isLoading: boolean = false;
    isAllSelected: boolean = false;

    showModal: boolean = false;
    modalMessage: string = '';
    modalType: 'success' | 'error' = 'success';

    constructor(
        private sectionService: SectionService,
        private userSectionService: UserSectionService,
        private router: Router,
        private sectionName: SectionsNamesUtilsService
    ) { }

    ngOnInit(): void {
        this.sectionService.getSections().subscribe(data => {
            this.sections = data.map(s => ({
                ...s, displayName: this.sectionName.formatSectionName(s.name)
            }));

            this.userSectionService.getUserSections().subscribe(userSections => {
                this.selectedSections = userSections;
                this.isAllSelected = this.selectedSections.length === this.sections.length;
            });
        });
    }

    toggleSelection(id: number): void {
        if (this.selectedSections.includes(id)) {
            this.selectedSections = this.selectedSections.filter(s => s !== id);
        }
        else {
            this.selectedSections.push(id);
        }
    }

    toggleAll(): void {
        if (this.isAllSelected) {
            this.selectedSections = [];
            this.isAllSelected = false;
        } else {
            this.selectedSections = this.sections.map(s => s.id);
            this.isAllSelected = true;
        }
    }

    saveSelection(): void {
        this.userSectionService.saveUserSections(this.selectedSections).subscribe({
            next: () => {
                this.modalMessage = 'Sections saved successfully!';
                this.modalType = 'success';
                this.showModal = true;
            },
            error: (err) => {
                this.modalMessage = 'Error saving sections.';
                this.modalType = 'error';
                this.showModal = true;
            }
        });
    }

    onCheckboxChange(section: Section, event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.checked) {
            if (!this.selectedSections.includes(section.id)) {
                this.selectedSections.push(section.id)
            }
        } else {
            this.selectedSections = this.selectedSections.filter(s => s !== section.id)
        }
    }

    selectAll(): void {
        this.selectedSections = this.sections.map(s => s.id);
    }

    get selectAllButtonText(): string {
        return this.selectedSections.length === this.sections.length ? 'Unselect All' : 'Select All';
    }

    closeModal(confirmed: boolean) {
        this.showModal = false;
        if (this.modalType === 'success') {
            this.router.navigate(['/news']);
        }
    }
}