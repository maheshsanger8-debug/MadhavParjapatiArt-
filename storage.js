import { storage } from './init.js';
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  getBytes,
  getStream
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';

export class StorageService {
  constructor() {
    this.uploadProgress = {};
    this.uploadCancelled = {};
  }

  /**
   * Upload product image with progress tracking
   * @param {File} file - The file to upload
   * @param {string} productId - Optional product ID
   * @param {Function} onProgress - Progress callback (0-100)
   * @param {Function} onCancel - Optional cancel function reference
   * @returns {Promise<Object>} Upload result
   */
  async uploadProductImage(file, productId = null, onProgress = null, cancelToken = null) {
    try {
      // Validate file first
      const validation = this.validateImage(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Optimize image before upload
      const optimizedFile = await this.optimizeImage(file);
      
      const timestamp = Date.now();
      const sanitizedFileName = this.sanitizeFileName(file.name);
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const storagePath = productId 
        ? `products/${productId}/${fileName}`
        : `products/temp/${fileName}`;
      
      const storageRef = ref(storage, storagePath);
      
      // Set metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadDate: new Date().toISOString(),
          uploadedBy: 'admin',
          productId: productId || 'temp',
          size: optimizedFile.size.toString(),
          optimized: optimizedFile.size !== file.size ? 'true' : 'false'
        }
      };

      // Use resumable upload if progress tracking is needed
      if (onProgress) {
        return await this.uploadWithProgress(
          storageRef, 
          optimizedFile, 
          metadata, 
          onProgress, 
          cancelToken
        );
      } else {
        // Simple upload
        const snapshot = await uploadBytes(storageRef, optimizedFile, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return { 
          success: true, 
          url: downloadURL, 
          path: storagePath,
          fileName: fileName,
          size: optimizedFile.size,
          type: file.type
        };
      }
    } catch (error) {
      console.error('Upload error:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code || 'unknown'
      };
    }
  }

  /**
   * Upload with progress tracking
   */
  async uploadWithProgress(storageRef, file, metadata, onProgress, cancelToken) {
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      // Store upload task for potential cancellation
      if (cancelToken) {
        cancelToken.cancel = () => {
          uploadTask.cancel();
          reject({ success: false, error: 'Upload cancelled' });
        };
      }

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          if (error.code === 'storage/canceled') {
            resolve({ success: false, error: 'Upload cancelled' });
          } else {
            reject({ success: false, error: error.message });
          }
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            success: true,
            url: downloadURL,
            path: uploadTask.snapshot.ref.fullPath,
            size: file.size
          });
        }
      );
    });
  }

  /**
   * Upload multiple product images with batch processing
   */
  async uploadMultipleProductImages(files, productId = null, onProgress = null) {
    const results = {
      success: true,
      urls: [],
      failed: [],
      totalSize: 0
    };

    const totalFiles = files.length;
    let completedFiles = 0;

    for (const file of files) {
      try {
        // Validate each file
        const validation = this.validateImage(file);
        if (!validation.valid) {
          results.failed.push({
            name: file.name,
            error: validation.error
          });
          results.success = false;
          continue;
        }

        const result = await this.uploadProductImage(
          file, 
          productId,
          (progress) => {
            if (onProgress) {
              const overallProgress = (completedFiles / totalFiles) * 100 + 
                                     (progress / totalFiles);
              onProgress(Math.min(overallProgress, 100));
            }
          }
        );

        if (result.success) {
          results.urls.push(result.url);
          results.totalSize += result.size || file.size;
        } else {
          results.failed.push({
            name: file.name,
            error: result.error
          });
          results.success = false;
        }
      } catch (error) {
        results.failed.push({
          name: file.name,
          error: error.message
        });
        results.success = false;
      } finally {
        completedFiles++;
      }
    }

    return results;
  }

  /**
   * Upload logo with optimization
   */
  async uploadLogo(file, onProgress = null) {
    const validation = this.validateImage(file, true); // strict validation for logo
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const optimizedFile = await this.optimizeImage(file, { maxWidth: 400, maxHeight: 200 });
      const timestamp = Date.now();
      const fileName = `logo_${timestamp}${this.getFileExtension(file.name)}`;
      const storageRef = ref(storage, `logos/${fileName}`);
      
      const metadata = {
        contentType: file.type,
        customMetadata: {
          type: 'logo',
          uploadDate: new Date().toISOString()
        }
      };

      let downloadURL;
      if (onProgress) {
        const result = await this.uploadWithProgress(storageRef, optimizedFile, metadata, onProgress);
        downloadURL = result.url;
      } else {
        const snapshot = await uploadBytes(storageRef, optimizedFile, metadata);
        downloadURL = await getDownloadURL(snapshot.ref);
      }

      // Delete old logos (keep only last 5)
      await this.cleanupOldFiles('logos', 5);

      return { success: true, url: downloadURL, path: storageRef.fullPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload banner with optimization
   */
  async uploadBanner(file, onProgress = null) {
    const validation = this.validateImage(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const optimizedFile = await this.optimizeImage(file, { maxWidth: 1920, maxHeight: 1080 });
      const timestamp = Date.now();
      const fileName = `banner_${timestamp}${this.getFileExtension(file.name)}`;
      const storageRef = ref(storage, `banners/${fileName}`);
      
      const metadata = {
        contentType: file.type,
        customMetadata: {
          type: 'banner',
          uploadDate: new Date().toISOString()
        }
      };

      let downloadURL;
      if (onProgress) {
        const result = await this.uploadWithProgress(storageRef, optimizedFile, metadata, onProgress);
        downloadURL = result.url;
      } else {
        const snapshot = await uploadBytes(storageRef, optimizedFile, metadata);
        downloadURL = await getDownloadURL(snapshot.ref);
      }

      // Keep only recent banners
      await this.cleanupOldFiles('banners', 10);

      return { success: true, url: downloadURL, path: storageRef.fullPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete file with verification
   */
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      
      // Check if file exists by getting metadata
      try {
        await getMetadata(storageRef);
      } catch (error) {
        if (error.code === 'storage/object-not-found') {
          return { success: false, error: 'File not found' };
        }
      }

      await deleteObject(storageRef);
      return { success: true, path: path };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete all images for a product
   */
  async deleteProductImages(productId) {
    try {
      const folderRef = ref(storage, `products/${productId}`);
      const list = await listAll(folderRef);
      
      if (list.items.length === 0) {
        return { success: true, message: 'No images found' };
      }

      const deletePromises = list.items.map(async (item) => {
        try {
          await deleteObject(item);
          return { success: true, path: item.fullPath };
        } catch (error) {
          return { success: false, path: item.fullPath, error: error.message };
        }
      });

      const results = await Promise.all(deletePromises);
      const failed = results.filter(r => !r.success);

      return {
        success: failed.length === 0,
        deleted: results.filter(r => r.success).length,
        failed: failed,
        total: list.items.length
      };
    } catch (error) {
      console.error('Batch delete error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path) {
    try {
      const storageRef = ref(storage, path);
      const metadata = await getMetadata(storageRef);
      return { success: true, metadata };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(path, newMetadata) {
    try {
      const storageRef = ref(storage, path);
      const metadata = await updateMetadata(storageRef, newMetadata);
      return { success: true, metadata };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Copy/move file to new location
   */
  async copyFile(sourcePath, destinationPath) {
    try {
      // Get source file data
      const sourceRef = ref(storage, sourcePath);
      const url = await getDownloadURL(sourceRef);
      
      // Download file data
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Upload to new location
      const destRef = ref(storage, destinationPath);
      await uploadBytes(destRef, blob);
      
      return { success: true, path: destinationPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all files in a folder
   */
  async listFiles(folderPath) {
    try {
      const folderRef = ref(storage, folderPath);
      const list = await listAll(folderRef);
      
      const files = await Promise.all(
        list.items.map(async (item) => {
          const metadata = await getMetadata(item);
          return {
            name: item.name,
            path: item.fullPath,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated
          };
        })
      );

      return {
        success: true,
        files: files,
        prefixes: list.prefixes.map(p => p.fullPath)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up old files keeping only recent ones
   */
  async cleanupOldFiles(folderPath, keepCount) {
    try {
      const result = await this.listFiles(folderPath);
      if (!result.success) return;

      // Sort by creation time
      const files = result.files.sort((a, b) => 
        new Date(b.timeCreated) - new Date(a.timeCreated)
      );

      // Delete older files beyond keepCount
      const filesToDelete = files.slice(keepCount);
      const deletePromises = filesToDelete.map(file => 
        this.deleteFile(file.path)
      );

      await Promise.all(deletePromises);
      return { success: true, deleted: filesToDelete.length };
    } catch (error) {
      console.error('Cleanup error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get file extension
   */
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
  }

  /**
   * Sanitize filename
   */
  sanitizeFileName(filename) {
    // Remove special characters and spaces
    return filename
      .replace(/[^a-zA-Z0-9.]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }

  /**
   * Validate image file
   */
  validateImage(file, strict = false) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    const maxSize = strict ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB for logos, 5MB for others
    
    if (!validTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Invalid file type. Please upload: ${validTypes.join(', ')}` 
      };
    }
    
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` 
      };
    }

    // Check dimensions for strict validation (like logos)
    if (strict) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(img.src);
          if (img.width > 500 || img.height > 300) {
            resolve({ valid: false, error: 'Logo dimensions should be max 500x300 pixels' });
          } else {
            resolve({ valid: true });
          }
        };
        img.onerror = () => {
          resolve({ valid: true }); // Skip dimension check if image can't be loaded
        };
        img.src = URL.createObjectURL(file);
      });
    }
    
    return { valid: true };
  }

  /**
   * Optimize image before upload
   */
  async optimizeImage(file, options = {}) {
    const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options;
    
    // Skip optimization for SVG
    if (file.type === 'image/svg+xml') {
      return file;
    }

    try {
      const img = await this.createImageBitmap(file);
      
      if (img.width <= maxWidth && img.height <= maxHeight) {
        return file; // No optimization needed
      }

      // Calculate new dimensions
      let newWidth = img.width;
      let newHeight = img.height;
      
      if (newWidth > maxWidth) {
        newHeight = Math.round((newHeight * maxWidth) / newWidth);
        newWidth = maxWidth;
      }
      
      if (newHeight > maxHeight) {
        newWidth = Math.round((newWidth * maxHeight) / newHeight);
        newHeight = maxHeight;
      }

      // Create canvas and resize
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convert to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, file.type, quality);
      });

      // Create optimized file
      return new File([blob], file.name, {
        type: file.type,
        lastModified: Date.now()
      });
    } catch (error) {
      console.warn('Image optimization failed:', error);
      return file; // Return original if optimization fails
    }
  }

  /**
   * Create image bitmap
   */
  createImageBitmap(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        createImageBitmap(img)
          .then(resolve)
          .catch(reject);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate image variants (thumbnails)
   */
  async generateThumbnail(file, size = 200) {
    try {
      const img = await this.createImageBitmap(file);
      
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      
      // Calculate dimensions for cover
      const scale = Math.max(size / img.width, size / img.height);
      const x = (size - img.width * scale) / 2;
      const y = (size - img.height * scale) / 2;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.7);
      });

      return new File([blob], `thumb_${file.name}`, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      return null;
    }
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const storageService = new StorageService();