"use client";
import React, { useState, useRef } from "react";
import { uploadPostMedia } from "@/app/actions/posts";
import { POST_VALIDATION } from "@/types/posts";

interface PostMediaUploaderProps {
  onUploadComplete: (url: string, type: 'image' | 'video') => void;
  maxFiles?: number;
  currentCount?: number;
}

const PostMediaUploader: React.FC<PostMediaUploaderProps> = ({
  onUploadComplete,
  maxFiles = POST_VALIDATION.MAX_MEDIA_FILES,
  currentCount = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

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

    // Check if max files reached
    if (currentCount >= maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file type
    const isImage = (POST_VALIDATION.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type);
    const isVideo = (POST_VALIDATION.ALLOWED_VIDEO_TYPES as readonly string[]).includes(file.type);

    if (!isImage && !isVideo) {
      setError('Invalid file type. Only images (JPG, PNG, WebP) and videos (MP4, WebM) are allowed');
      return;
    }

    // Validate file size
    const maxSize = isImage ? POST_VALIDATION.MAX_IMAGE_SIZE : POST_VALIDATION.MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Upload
    setUploading(true);
    const formData = new FormData();
    formData.append('media', file);

    const result = await uploadPostMedia(formData);

    if (!result.success) {
      setError(result.error || 'Failed to upload media');
      setUploading(false);
      return;
    }

    setUploading(false);
    onUploadComplete(result.url!, result.type! as 'image' | 'video');
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const isDisabled = uploading || currentCount >= maxFiles;

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10'
            : 'border-gray-300 dark:border-gray-700'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-brand-400'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isDisabled ? handleButtonClick : undefined}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-3"></div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <svg
              className="w-12 h-12 mb-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isDisabled ? `Maximum ${maxFiles} files reached` : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Images: JPG, PNG, WebP (max 10MB) • Videos: MP4, WebM (max 100MB)
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {currentCount} / {maxFiles} files uploaded
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={[...POST_VALIDATION.ALLOWED_IMAGE_TYPES, ...POST_VALIDATION.ALLOWED_VIDEO_TYPES].join(',')}
          onChange={handleChange}
          disabled={isDisabled}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PostMediaUploader;
