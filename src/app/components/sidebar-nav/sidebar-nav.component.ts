import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { ThemePalette } from '@angular/material/core';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  badgeColor?: ThemePalette;
}

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './sidebar-nav.component.html',
  styleUrls: ['./sidebar-nav.component.css']
})
export class SidebarNavComponent {
  @Input() isOpen = true;
  @Input() currentSection = '';
  @Input() navItems: NavItem[] = [];
  @Input() userEmail?: string;
  @Input() username?: string;

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() sectionChange = new EventEmitter<string>();

  onToggleSidenav() {
    this.toggleSidenav.emit();
  }

  onSectionChange(section: string) {
    this.sectionChange.emit(section);
  }
} 