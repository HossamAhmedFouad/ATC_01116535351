import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AssetsService, UploadResponse } from '../../services/assets.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="file-upload-container"
      [class.drag-over]="isDragOver"
      [class.has-file]="fileName"
      [class.disabled]="disabled"
      [class.uploading]="isUploading"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <input
        type="file"
        class="file-input"
        [accept]="accept"
        [multiple]="multiple"
        [disabled]="disabled || isUploading"
        #fileInput
        (change)="onFileSelected($event)"
      />

      <div class="upload-content" *ngIf="!fileName && !isUploading">
        <div class="upload-icon">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
        <div class="upload-text">
          <h3>{{ title }}</h3>
          <p>{{ description }}</p>
          <p class="file-types">{{ acceptedFileTypesText }}</p>
        </div>
        <button
          type="button"
          class="browse-button"
          [disabled]="disabled || isUploading"
          (click)="fileInput.click()"
        >
          Browse Files
        </button>
      </div>

      <div class="file-preview" *ngIf="fileName && !isUploading">
        <div class="file-info">
          <mat-icon *ngIf="!previewUrl">description</mat-icon>
          <img
            *ngIf="previewUrl"
            [src]="previewUrl"
            alt="File preview"
            class="preview-image"
          />
          <div class="file-details">
            <span class="file-name">{{ fileName }}</span>
            <span class="file-size">{{ formatFileSize(fileSize) }}</span>
          </div>
        </div>
        <div class="file-actions">
          <button
            type="button"
            class="replace-button"
            [disabled]="disabled"
            (click)="fileInput.click()"
          >
            Replace
          </button>
          <button
            type="button"
            class="remove-button"
            [disabled]="disabled"
            (click)="removeFile()"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <div class="upload-progress" *ngIf="isUploading">
        <mat-progress-bar
          mode="determinate"
          [value]="uploadProgress"
        ></mat-progress-bar>
        <div class="progress-text">
          Uploading {{ fileName }}... {{ uploadProgress }}%
        </div>
        <button type="button" class="cancel-button" (click)="cancelUpload()">
          Cancel
        </button>
      </div>

      <div class="upload-error" *ngIf="errorMessage">
        <mat-icon>error</mat-icon>
        <span>{{ errorMessage }}</span>
        <button type="button" class="retry-button" (click)="fileInput.click()">
          Try Again
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent implements ControlValueAccessor, OnDestroy {
  @Input() accept = 'image/*';
  @Input() multiple = false;
  @Input() maxFileSize = 5 * 1024 * 1024; // 5MB
  @Input() bucket = 'images';
  @Input() folder = '';
  @Input() title = 'Drag & Drop';
  @Input() description = 'Drag and drop your file here or click to browse';
  @Input() icon = 'cloud_upload';

  @Output() uploadComplete = new EventEmitter<UploadResponse>();
  @Output() uploadError = new EventEmitter<Error>();
  @Output() fileSelected = new EventEmitter<File>();

  isDragOver = false;
  fileName = '';
  fileSize = 0;
  file: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  previewUrl: string | null = null;
  errorMessage = '';
  disabled = false;
  private signedUrlSubscription?: Subscription;

  // For ControlValueAccessor
  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private assetsService: AssetsService) {}

  ngOnDestroy(): void {
    this.signedUrlSubscription?.unsubscribe();
  }

  get acceptedFileTypesText(): string {
    if (this.accept === '*') return 'All file types supported';
    if (this.accept === 'image/*')
      return 'Supported image formats: JPG, PNG, GIF, WebP, SVG';

    return `Accepted file types: ${this.accept}`;
  }

  writeValue(value: any): void {
    // If a path is provided, get a signed URL for preview
    if (value && typeof value === 'string') {
      this.fileName = value.split('/').pop() || '';
      this.loadPreviewUrl(value);
    } else {
      this.reset();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled && !this.isUploading) {
      this.isDragOver = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (this.disabled || this.isUploading) return;

    if (event.dataTransfer && event.dataTransfer.files.length) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length) {
      this.processFiles(input.files);
    }
  }

  processFiles(files: FileList): void {
    this.errorMessage = '';

    // If multiple is false, just take the first file
    const file = files[0];

    // Validate file type
    if (!this.validateFileType(file)) {
      this.errorMessage =
        'Invalid file type. Please select a supported file format.';
      this.uploadError.emit(new Error(this.errorMessage));
      return;
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      this.errorMessage = `File is too large. Maximum size is ${this.formatFileSize(
        this.maxFileSize
      )}.`;
      this.uploadError.emit(new Error(this.errorMessage));
      return;
    }

    this.file = file;
    this.fileName = file.name;
    this.fileSize = file.size;
    this.fileSelected.emit(file);

    // Create a preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }

    // Notify FormControl of the change
    this.onChange(file);
    this.onTouched();

    // Auto upload if needed
    this.uploadFile();
  }

  uploadFile(): void {
    if (!this.file || this.isUploading) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.errorMessage = '';

    // Start with initial progress
    this.uploadProgress = 10;

    this.assetsService
      .uploadFile(this.file, this.bucket, this.folder)
      .subscribe({
        next: (response: UploadResponse) => {
          this.uploadProgress = 100;
          // Store the path and load preview URL
          this.loadPreviewUrl(response.path);

          setTimeout(() => {
            this.isUploading = false;
            // Update form control with the file path
            this.onChange(response.path);
            this.uploadComplete.emit(response);
          }, 500);
        },
        error: (error) => {
          this.isUploading = false;
          this.uploadProgress = 0;
          this.errorMessage =
            error.message || 'Upload failed. Please try again.';
          this.uploadError.emit(error);
        },
      });
  }

  private loadPreviewUrl(path: string): void {
    // Clean up previous subscription
    this.signedUrlSubscription?.unsubscribe();

    // For image files, get a signed URL for preview
    if (this.accept === 'image/*' || this.file?.type.startsWith('image/')) {
      this.signedUrlSubscription = this.assetsService
        .getSignedUrl(path, this.bucket)
        .subscribe({
          next: (response) => {
            this.previewUrl = response.signedUrl;
          },
          error: () => {
            this.previewUrl = null;
          },
        });
    } else {
      this.previewUrl = null;
    }
  }

  removeFile(): void {
    if (this.fileName && !this.file) {
      // If we have a fileName but no file, it means we're removing an existing file
      this.assetsService.deleteFile(this.fileName, this.bucket).subscribe({
        next: () => {
          this.reset();
          this.onChange(null);
          this.onTouched();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to remove file.';
        },
      });
    } else {
      this.reset();
      this.onChange(null);
      this.onTouched();
    }
  }

  cancelUpload(): void {
    // In a real app, you would abort the HTTP request here
    this.isUploading = false;
    this.uploadProgress = 0;
  }

  reset(): void {
    this.file = null;
    this.fileName = '';
    this.fileSize = 0;
    this.previewUrl = null;
    this.errorMessage = '';
    this.uploadProgress = 0;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private validateFileType(file: File): boolean {
    // Use the same validation as AssetsService
    if (this.accept === 'image/*') {
      return this.assetsService['supportedImageTypes'].includes(file.type);
    }

    if (this.accept === '*') return true;

    const acceptedTypes = this.accept.split(',').map((type) => type.trim());
    return acceptedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const prefix = type.split('/')[0];
        return file.type.startsWith(`${prefix}/`);
      }
      return file.type === type;
    });
  }
}
