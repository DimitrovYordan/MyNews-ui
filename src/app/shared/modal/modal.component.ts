import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent implements OnChanges {
  @Input() show: boolean = false;
  @Input() type: 'success' | 'error' = 'success';
  @Input() message: string = '';
  @Input() showCancel: boolean = true;
  @Input() autoClose: boolean = true;
  @Output() closed = new EventEmitter<boolean>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && this.show) {
      setTimeout(() => {
        this.close();
      }, 2000);
    }
  }

  confirm() {
    this.closed.emit(true);
  }

  cancel() {
    this.closed.emit(false);
    this.show = false;
  }

  close() {
    this.closed.emit(false);
    this.show = false;
  }
}
