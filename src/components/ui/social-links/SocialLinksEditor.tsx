"use client";
import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { SocialMedia } from "@/types/profile";

interface SocialLinksEditorProps {
  initialData: SocialMedia | null;
  onSave: (data: SocialMedia) => void;
  onCancel: () => void;
  saving?: boolean;
}

const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({
  initialData,
  onSave,
  onCancel,
  saving = false,
}) => {
  const [formData, setFormData] = useState<SocialMedia>({
    instagram: initialData?.instagram || "",
    facebook: initialData?.facebook || "",
    linkedin: initialData?.linkedin || "",
  });

  const [errors, setErrors] = useState<Partial<SocialMedia>>({});

  const validateUrl = (url: string, platform: string): string | null => {
    if (!url) return null; // Empty is valid

    // Basic URL validation
    try {
      const urlObj = new URL(url);
      
      // Platform-specific validation
      switch (platform) {
        case "instagram":
          if (!urlObj.hostname.includes("instagram.com")) {
            return "Must be a valid Instagram URL";
          }
          break;
        case "facebook":
          if (!urlObj.hostname.includes("facebook.com") && !urlObj.hostname.includes("fb.com")) {
            return "Must be a valid Facebook URL";
          }
          break;
        case "linkedin":
          if (!urlObj.hostname.includes("linkedin.com")) {
            return "Must be a valid LinkedIn URL";
          }
          break;
      }
      
      return null;
    } catch {
      return "Must be a valid URL (e.g., https://instagram.com/username)";
    }
  };

  const handleChange = (platform: keyof SocialMedia, value: string) => {
    setFormData((prev) => ({ ...prev, [platform]: value }));
    
    // Clear error when user starts typing
    if (errors[platform]) {
      setErrors((prev) => ({ ...prev, [platform]: undefined }));
    }
  };

  const handleSave = () => {
    // Validate all fields
    const newErrors: Partial<SocialMedia> = {};
    
    if (formData.instagram) {
      const error = validateUrl(formData.instagram, "instagram");
      if (error) newErrors.instagram = error;
    }
    
    if (formData.facebook) {
      const error = validateUrl(formData.facebook, "facebook");
      if (error) newErrors.facebook = error;
    }
    
    if (formData.linkedin) {
      const error = validateUrl(formData.linkedin, "linkedin");
      if (error) newErrors.linkedin = error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Remove empty strings
    const cleanedData: SocialMedia = {};
    if (formData.instagram) cleanedData.instagram = formData.instagram;
    if (formData.facebook) cleanedData.facebook = formData.facebook;
    if (formData.linkedin) cleanedData.linkedin = formData.linkedin;

    onSave(cleanedData);
  };

  return (
    <div className="space-y-5">
      <div>
        <Label>Instagram</Label>
        <Input
          type="url"
          placeholder="https://instagram.com/username"
          defaultValue={formData.instagram}
          onChange={(e) => handleChange("instagram", e.target.value)}
          error={!!errors.instagram}
          hint={errors.instagram}
        />
      </div>

      <div>
        <Label>Facebook</Label>
        <Input
          type="url"
          placeholder="https://facebook.com/username"
          defaultValue={formData.facebook}
          onChange={(e) => handleChange("facebook", e.target.value)}
          error={!!errors.facebook}
          hint={errors.facebook}
        />
      </div>

      <div>
        <Label>LinkedIn</Label>
        <Input
          type="url"
          placeholder="https://linkedin.com/in/username"
          defaultValue={formData.linkedin}
          onChange={(e) => handleChange("linkedin", e.target.value)}
          error={!!errors.linkedin}
          hint={errors.linkedin}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default SocialLinksEditor;
