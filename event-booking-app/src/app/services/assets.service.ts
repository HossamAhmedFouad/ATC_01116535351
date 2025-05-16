import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';
import { ToastService } from './toast.service';

// Match the backend's response type
export interface UploadResponse {
  path: string; // Path in the bucket where file was uploaded
  fullPath: string; // Complete path including bucket
  id: string; // Unique identifier for the file
  size: number; // File size in bytes
  signedUrl?: string; // Signed URL for private access
  publicUrl?: string; // Public URL for the file
}

export interface SignedUrlResponse {
  signedUrl: string;
  path: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  private apiUrl = `${environment.apiUrl}/assets`;

  // Match the backend's allowed mime types
  private supportedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  // Match the backend's file size limit (5MB)
  private maxFileSize = 5 * 1024 * 1024;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  /**
   * Upload a file to the Supabase storage bucket
   * @param file The file to upload
   * @param bucket The storage bucket name (default: 'images')
   * @param folder Optional folder path within the bucket
   * @returns Observable with the upload response
   */
  uploadFile(
    file: File,
    bucket: string = 'images',
    folder: string = ''
  ): Observable<UploadResponse> {
    // Validate file type
    if (!this.validateFileType(file)) {
      this.toastService.error(
        'Invalid file type. Only images (JPG, PNG, GIF, WebP, SVG) are allowed.'
      );
      return throwError(() => new Error('Invalid file type'));
    }

    // Validate file size
    if (!this.validateFileSize(file)) {
      this.toastService.error('File size limit exceeded (5MB maximum).');
      return throwError(() => new Error('File size exceeds limit'));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    if (folder) {
      formData.append('folder', folder);
    }

    return this.http
      .post<UploadResponse>(`${this.apiUrl}/upload`, formData)
      .pipe(
        catchError((error) => {
          this.toastService.error(
            error.error?.error || 'Failed to upload file. Please try again.'
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete a file from the Supabase storage bucket
   * @param path The full path of the file to delete
   * @param bucket The storage bucket name (default: 'images')
   * @returns Observable with the delete response
   */
  deleteFile(
    path: string,
    bucket: string = 'images'
  ): Observable<{ message: string }> {
    // Match backend route structure: DELETE /:bucket with path in body
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${bucket}`, {
        body: { path },
      })
      .pipe(
        catchError((error) => {
          this.toastService.error(
            error.error?.error || 'Failed to delete file. Please try again.'
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * Get a signed URL for a file in the Supabase storage bucket
   * @param path The full path of the file
   * @param bucket The storage bucket name (default: 'images')
   * @param expiresIn Expiration time in seconds (default: 3600 - 1 hour)
   * @returns Observable with the signed URL response
   */
  getSignedUrl(
    path: string,
    bucket: string = 'images',
    expiresIn: number = 3600
  ): Observable<SignedUrlResponse> {
    return this.http
      .get<SignedUrlResponse>(`${this.apiUrl}/signed-url`, {
        params: { path, bucket, expiresIn: expiresIn.toString() },
      })
      .pipe(
        catchError((error) => {
          this.toastService.error(
            error.error?.error || 'Failed to get file URL.'
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * Validate the file type
   * @param file The file to validate
   * @returns Boolean indicating if the file type is valid
   */
  private validateFileType(file: File): boolean {
    return this.supportedImageTypes.includes(file.type);
  }

  /**
   * Validate the file size
   * @param file The file to validate
   * @returns Boolean indicating if the file size is valid
   */
  private validateFileSize(file: File): boolean {
    return file.size <= this.maxFileSize;
  }
}
