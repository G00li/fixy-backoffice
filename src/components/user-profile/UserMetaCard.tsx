"use client";
import React, { useState, useEffect, useRef } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { updateOwnProfile, checkUsernameAvailability, uploadAvatar, deleteAvatar } from "@/app/actions/users";
import { useRouter } from "next/navigation";

interface UserMetaCardProps {
  profile: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
    location_text: string | null;
    role: string | null;
  };
}

export default function UserMetaCard({ profile }: UserMetaCardProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    username: profile.username || '',
  });

  // Debounced username check
  useEffect(() => {
    if (!isEditing || !formData.username || formData.username === profile.username) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      const result = await checkUsernameAvailability(formData.username);
      setCheckingUsername(false);
      
      if (result.success) {
        setUsernameAvailable(result.available);
      } else {
        setUsernameAvailable(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, isEditing, profile.username]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, and WebP are allowed');
      return;
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 2MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to delete your avatar?')) return;

    setUploading(true);
    setError(null);

    const result = await deleteAvatar();

    if (!result.success) {
      setError(result.error || 'Failed to delete avatar');
      setUploading(false);
      return;
    }

    setUploading(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    router.refresh();
  };

  const handleSave = async () => {
    setError(null);

    // Validate username if changed
    if (formData.username !== profile.username) {
      if (!formData.username) {
        setError('Username is required');
        return;
      }
      if (usernameAvailable === false) {
        setError('Username is not available');
        return;
      }
    }

    setSaving(true);

    // Upload avatar if file selected
    if (selectedFile) {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', selectedFile);

      const uploadResult = await uploadAvatar(formDataUpload);
      setUploading(false);

      if (!uploadResult.success) {
        setError(uploadResult.error || 'Failed to upload avatar');
        setSaving(false);
        return;
      }
    }

    // Update username if changed
    if (formData.username !== profile.username) {
      const updateParams: any = {
        username: formData.username.toLowerCase(),
      };

      const result = await updateOwnProfile(updateParams);

      if (!result.success) {
        setError(result.error || 'Failed to update profile');
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    router.refresh();
  };

  const handleCancel = () => {
    setFormData({
      username: profile.username || '',
    });
    setError(null);
    setUsernameAvailable(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const displayAvatarUrl = previewUrl || profile.avatar_url;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row xl:items-start">
          <div className="relative group">
            <div className="relative w-20 h-20 overflow-hidden border-2 border-gray-200 rounded-full dark:border-gray-700 flex-shrink-0 transition-all duration-200 group-hover:border-brand-500">
              {displayAvatarUrl ? (
                <Image
                  width={80}
                  height={80}
                  src={displayAvatarUrl}
                  alt={profile.full_name || 'User'}
                  className={`w-20 h-20 object-cover transition-all duration-200 ${isEditing && !uploading ? 'group-hover:brightness-75' : ''}`}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center bg-brand-50 dark:bg-brand-500/15">
                  <span className="text-2xl font-medium text-brand-500 dark:text-brand-400">
                    {getInitials()}
                  </span>
                </div>
              )}
              
              {/* Upload overlay - only show in edit mode */}
              {isEditing && !uploading && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-transparent hover:bg-black/40 transition-all duration-200 cursor-pointer"
                  >
                  </button>
                </>
              )}
              
              {/* Loading overlay */}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>
            
            {/* Edit icon badge - only show in edit mode */}
            {isEditing && !uploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex items-center justify-center w-7 h-7 bg-brand-500 hover:bg-brand-600 rounded-full border-2 border-white dark:border-gray-900 shadow-lg transition-all duration-200 group-hover:scale-110 cursor-pointer"
                title="Change avatar"
              >
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            
            {/* Delete button - only show in edit mode if avatar exists */}
            {isEditing && (profile.avatar_url || previewUrl) && !uploading && (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full border-2 border-white dark:border-gray-900 shadow-lg transition-all duration-200 group-hover:scale-110"
                title="Delete avatar"
              >
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex-1 w-full">
            {!isEditing ? (
              <div className="text-center xl:text-left">
                <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                  {profile.full_name || 'No name'}
                </h4>
                {profile.username && (
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    @{profile.username}
                  </p>
                )}
                <div className="flex flex-col items-center gap-1 xl:flex-row xl:gap-3 xl:items-center">
                  {profile.bio && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profile.bio}
                    </p>
                  )}
                  {profile.bio && profile.location_text && (
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  )}
                  {profile.location_text && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profile.location_text}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Username</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                      placeholder="username"
                      className="pr-8"
                    />
                    {checkingUsername && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500"></div>
                      </div>
                    )}
                    {!checkingUsername && usernameAvailable === true && formData.username !== profile.username && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {!checkingUsername && usernameAvailable === false && formData.username !== profile.username && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    3-30 characters (lowercase, numbers, underscore, hyphen)
                  </p>
                </div>
                
                {selectedFile && (
                  <div className="rounded-lg bg-brand-50 dark:bg-brand-500/10 p-3 border border-brand-200 dark:border-brand-500/20">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-700 dark:text-brand-400 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-brand-600 dark:text-brand-500">
                          {(selectedFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto xl:flex-shrink-0">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 xl:w-auto"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                  fill=""
                />
              </svg>
              Edit
            </button>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={saving || uploading}
                className="flex-1 xl:flex-initial"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={saving || uploading || checkingUsername || (usernameAvailable === false && formData.username !== profile.username)}
                className="flex-1 xl:flex-initial"
              >
                {saving || uploading ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
