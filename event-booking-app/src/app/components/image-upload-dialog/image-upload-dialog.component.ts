import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="image-upload-dialog">
      <h2 class="dialog-title">Upload Event Image</h2>

      <div class="dialog-content">
        <form [formGroup]="imageForm">
          <div class="image-upload-container">
            <div class="image-preview" *ngIf="imagePreview">
              <img [src]="imagePreview" alt="Event image preview" />
              <button
                type="button"
                class="remove-image"
                (click)="removeImage()"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="upload-controls">
              <div class="form-group">
                <label class="form-label">Image URL</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="imageUrl"
                  placeholder="Enter image URL"
                />
              </div>

              <div class="or-divider">OR</div>

              <div class="file-upload-wrapper">
                <input
                  type="file"
                  class="file-input"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  #fileInput
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  (click)="fileInput.click()"
                >
                  <mat-icon>cloud_upload</mat-icon> Upload Image
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="dialog-actions">
        <button type="button" class="btn btn-text" (click)="cancel()">
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          [disabled]="!imagePreview"
          (click)="save()"
        >
          Save Image
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .image-upload-dialog {
        padding: 1.5rem;
        max-width: 500px;
      }

      .dialog-title {
        margin-top: 0;
        margin-bottom: 1.5rem;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .dialog-content {
        margin-bottom: 1.5rem;
      }

      .image-upload-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
      }

      .image-preview {
        position: relative;
        width: 100%;
        border-radius: 0.5rem;
        overflow: hidden;
        border: 1px solid #e0e0e0;
        height: 200px;
        margin-bottom: 1rem;
      }

      .image-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .remove-image {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .remove-image:hover {
        background-color: rgba(0, 0, 0, 0.8);
      }

      .upload-controls {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
      }

      .or-divider {
        display: flex;
        align-items: center;
        text-align: center;
        color: #6c757d;
        font-size: 0.875rem;
        margin: 0.5rem 0;
      }

      .or-divider::before,
      .or-divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #e0e0e0;
      }

      .or-divider::before {
        margin-right: 0.5em;
      }

      .or-divider::after {
        margin-left: 0.5em;
      }

      .file-upload-wrapper {
        position: relative;
      }

      .file-input {
        position: absolute;
        width: 0;
        height: 0;
        opacity: 0;
        cursor: pointer;
      }

      .file-upload-wrapper button {
        width: 100%;
        padding: 0.625rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background-color: #f8f9fa;
        border: 1px dashed #ced4da;
        color: #495057;
        border-radius: 0.5rem;
        transition: all 0.2s;
      }

      .file-upload-wrapper button:hover {
        background-color: #e9ecef;
        border-color: #6366f1;
        color: #6366f1;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .form-control {
        display: block;
        width: 100%;
        padding: 0.375rem 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
        color: #495057;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid #ced4da;
        border-radius: 0.375rem;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
      }

      .btn {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-text {
        background-color: transparent;
        border: none;
        color: #495057;
      }

      .btn-text:hover {
        color: #000;
        background-color: rgba(0, 0, 0, 0.05);
      }

      .btn-primary {
        background-color: #6366f1;
        border: 1px solid #6366f1;
        color: white;
      }

      .btn-primary:hover {
        background-color: #4f46e5;
        border-color: #4f46e5;
      }

      .btn-primary:disabled {
        background-color: #a5a6f6;
        border-color: #a5a6f6;
        cursor: not-allowed;
      }

      /* Dark mode styles */
      :host-context(.dark-mode) {
        .image-upload-dialog {
          background-color: #1e1e1e;
          color: #e0e0e0;
        }

        .form-control {
          background-color: #2d2d2d;
          border-color: #444;
          color: #e0e0e0;
        }

        .or-divider {
          color: #aaa;
        }

        .or-divider::before,
        .or-divider::after {
          border-color: #444;
        }

        .file-upload-wrapper button {
          background-color: #2d2d2d;
          border-color: #444;
          color: #e0e0e0;
        }

        .file-upload-wrapper button:hover {
          background-color: rgba(99, 102, 241, 0.15);
          border-color: #6366f1;
          color: #a5a6f6;
        }

        .btn-text {
          color: #e0e0e0;
        }

        .btn-text:hover {
          color: #fff;
          background-color: rgba(255, 255, 255, 0.1);
        }

        .btn-primary:disabled {
          background-color: #4b4b85;
          border-color: #4b4b85;
        }
      }
    `,
  ],
})
export class ImageUploadDialogComponent {
  imageForm: FormGroup;
  imagePreview: string | null = null;
  imageFile: File | null = null;

  constructor(
    private dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string }
  ) {
    this.imageForm = this.fb.group({
      imageUrl: [data.imageUrl || '', Validators.pattern(/^https?:\/\/.+/)],
    });

    // Watch for changes to the URL input
    this.imageForm.get('imageUrl')?.valueChanges.subscribe((url) => {
      if (url && this.isValidUrl(url)) {
        this.imagePreview = url;
      } else if (!url) {
        this.imagePreview = null;
      }
    });

    // Initialize image preview if URL is provided
    if (data.imageUrl) {
      this.imagePreview = data.imageUrl;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!allowedTypes.includes(this.imageFile.type)) {
        this.dialogRef.close({
          error: 'Please select a valid image file (JPEG, PNG, GIF, WEBP)',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (this.imageFile.size > 5 * 1024 * 1024) {
        this.dialogRef.close({
          error: 'Image file is too large. Maximum size is 5MB',
        });
        return;
      }

      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        // Clear the URL input when a file is selected
        this.imageForm.patchValue({ imageUrl: '' });
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreview = null;
    this.imageForm.patchValue({ imageUrl: '' });
  }

  save(): void {
    if (this.imagePreview) {
      this.dialogRef.close({
        imageUrl: this.imagePreview,
        imageFile: this.imageFile,
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }
}
