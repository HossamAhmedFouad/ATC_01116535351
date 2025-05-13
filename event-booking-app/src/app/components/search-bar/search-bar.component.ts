import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  @Input() placeholder = 'Search...';
  @Input() searchText = '';
  @Output() searchTextChange = new EventEmitter<string>();
  
  isFocused = false;

  onSearch() {
    this.searchTextChange.emit(this.searchText);
  }

  onFocus() {
    this.isFocused = true;
    console.log('Search bar focused'); // Debug log
  }

  onBlur() {
    this.isFocused = false;
    console.log('Search bar blurred'); // Debug log
  }

  clearSearch() {
    this.searchText = '';
    this.onSearch();
  }
} 