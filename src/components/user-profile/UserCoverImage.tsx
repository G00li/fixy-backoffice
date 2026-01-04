"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface UserCoverImageProps {
  profile: {
    id: string;
    cover_image_url: string | null;
  };
  onUpload: (formData: FormData) => Promise<{ success: boolean; url?: string; error?: string }>;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
}

export default function UserCoverImage({ profile, onUpload, onDelete }: UserCoverImageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.cover_image_url);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, and WebP are allowed');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    const formData = new FormData();
    formData.append('cover', file);

    const result = await onUpload(formData);

    if (!result.success) {
      setError(result.error || 'Failed to upload cover image');
      setPreviewUrl(profile.cover_image_url);
      setUploading(false);
      return;
    }

    setUploading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your cover image?')) {
      return;
    }

    setError(null);
    setDeleting(true);

    const result = await onDelete();

    if (!result.success) {
      setError(result.error || 'Failed to delete cover image');
      setDeleting(false);
      return;
    }

    setPreviewUrl(null);
    setDeleting(false);
    router.refresh();
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden dark:border-gray-800">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="relative">
        {/* Cover Image or Placeholder */}
        <div
          className={`relative w-full h-48 lg:h-64 bg-gradient-to-br from-brand-500 to-brand-600 ${
            dragActive ? 'ring-4 ring-brand-500 ring-opacity-50' : ''
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <svg
                  className="mx-auto h-12 w-12 mb-3 opacity-80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium">No cover image</p>
                <p className="text-xs opacity-80 mt-1">Drag & drop or click to upload</p>
              </div>
            </div>
          )}

          {/* Overlay with actions */}
          {!uploading && !deleting && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
              <button
                onClick={handleButtonClick}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-lg hover:bg-gray-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                {previewUrl ? 'Change' : 'Upload'}
              </button>

              {previewUrl && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-red-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          )}

          {/* Loading overlay */}
          {(uploading || deleting) && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Deleting...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Recommended size: 1920x400px • Max file size: 5MB • Formats: JPG, PNG, WebP
        </p>
      </div>
    </div>
  );
}
