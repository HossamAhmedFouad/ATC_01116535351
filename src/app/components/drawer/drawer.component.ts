import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-drawer',
  standalone: true,
  templateUrl: './drawer.component.html',
  imports: [
    DrawerModule,
    ButtonModule,
    AvatarModule,
    RippleModule,
    StyleClassModule
  ],
})
export class DrawerComponent {
  // Inputs
  @Input() visible: boolean = false; // Controls drawer visibility
  @Input() position: 'left' | 'right' | 'top' | 'bottom' = 'left'; // Drawer position
  @Input() modal: boolean = true; // Whether to block page interaction
  @Input() closeOnEscape: boolean = true; // Close drawer on ESC key
  @Input() dismissible: boolean = true; // Close drawer on backdrop click
  @Input() showCloseIcon: boolean = true; // Show/hide close button
  @Input() styleClass: string = ''; // Custom CSS class for styling

  // Outputs
  @Output() visibleChange = new EventEmitter<boolean>(); // Two-way binding
  @Output() onShow = new EventEmitter<void>(); // Emits when drawer opens
  @Output() onHide = new EventEmitter<void>(); // Emits when drawer closes

  // Mobile responsiveness
  isMobile: boolean = false;

  // Initialize mobile detection
  ngOnInit() {
    this.checkMobile();
  }

  // Handle window resize for responsiveness
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkMobile();
  }

  private checkMobile() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.position = 'bottom'; // Override position for mobile
    }
  }

  // Toggle drawer visibility
  toggle() {
    this.visible = !this.visible;
    this.visibleChange.emit(this.visible);
    if (this.visible) this.onShow.emit();
    else this.onHide.emit();
  }

  // Close drawer
  close() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onHide.emit();
  }
}