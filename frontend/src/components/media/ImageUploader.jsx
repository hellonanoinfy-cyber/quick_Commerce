'use client';

import { Upload, X, AlertCircle, Check } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { validateImageFile } from '@/services/media/media-service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * ImageUploader - Drag & drop image uploader with preview
 *
 * @param {object} props
 * @param {Function} props.onUpload - async function(file) => uploadedImage
 * @param {Function} props.onRemove - async function(imageId)
 * @param {Array} props.images - existing images [{ id, url, altText, isPrimary }]
 * @param {boolean} props.multiple - allow multiple uploads
 * @param {string} props.className
 */
export function ImageUploader({
  onUpload,
  onRemove,
  images = [],
  multiple = true,
  className = '',
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [localImages, setLocalImages] = useState(images);

  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const validateFiles = useCallback(files => {
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid type. Use JPG, PNG, or WEBP`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large (max 5MB)`);
        return;
      }
      validFiles.push(file);
    });

    return { validFiles, errors };
  }, []);

  const handleFiles = useCallback(
    async files => {
      const { validFiles, errors } = validateFiles(files);

      if (errors.length > 0) {
        setError(errors.join('\n'));
        setTimeout(() => setError(null), 5000);
      }

      if (validFiles.length === 0) return;

      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        for (let i = 0; i < validFiles.length; i++) {
          const result = await onUpload(validFiles[i], progress => {
            setProgress(Math.round((i * 100 + progress) / validFiles.length));
          });

          if (result && result.id) {
            setLocalImages(prev => [...prev, result]);
          }
        }
      } catch (err) {
        setError(err.message || 'Upload failed');
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [onUpload, validateFiles]
  );

  const handleDrop = useCallback(
    e => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer?.files;
      if (files?.length) handleFiles(files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback(e => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(e => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    e => {
      const files = e.target?.files;
      if (files?.length) handleFiles(files);
      e.target.value = '';
    },
    [handleFiles]
  );

  const handleRemove = useCallback(
    async image => {
      if (!image?.id) return;

      try {
        await onRemove(image.id);
        setLocalImages(prev => prev.filter(img => img.id !== image.id));
      } catch (err) {
        setError(err.message || 'Failed to remove image');
      }
    },
    [onRemove]
  );

  const handleSetPrimary = useCallback(async image => {
    if (!image?.id) return;
    // Emit event to parent to update primary
    setLocalImages(prev =>
      prev.map(img => ({
        ...img,
        isPrimary: img.id === image.id,
      }))
    );
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all
          ${
            dragOver
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && document.getElementById('image-uploader-input')?.click()}
      >
        <input
          id="image-uploader-input"
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple={multiple}
          className="hidden"
          onChange={handleInputChange}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Spinner size="md" />
            <p className="text-sm text-gray-600">Uploading... {progress}%</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold text-pink-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">JPG, PNG, or WEBP (max 5MB)</p>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {localImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {localImages.map((image, index) => (
            <div
              key={image.id || `local-${index}`}
              className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white"
            >
              <img
                src={image.url}
                alt={image.altText || 'Product image'}
                className="w-full aspect-square object-cover"
              />

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetPrimary(image)}
                  className={`p-2 rounded-full transition-colors ${
                    image.isPrimary
                      ? 'bg-pink-600 text-white'
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                  title={image.isPrimary ? 'Primary image' : 'Set as primary'}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(image)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Primary Badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-pink-600 text-white text-[10px] font-bold rounded-full">
                  PRIMARY
                </div>
              )}

              {/* Sort Order */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-black/60 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
