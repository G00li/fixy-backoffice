"use client";
import { useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { updateOwnProfile } from "@/app/actions/users";
import { useRouter } from "next/navigation";

interface UserAddressCardProps {
  profile: {
    id: string;
    postal_code: string | null;
    location_text: string | null;
    address: any;
  };
}

export default function UserAddressCard({ profile }: UserAddressCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = profile.address || {};

  const [formData, setFormData] = useState({
    country: address.country || '',
    city: address.city || '',
    postalCode: profile.postal_code || '',
    street: address.street || '',
  });

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    const addressData = {
      country: formData.country,
      city: formData.city,
      street: formData.street,
    };

    const result = await updateOwnProfile({
      postalCode: formData.postalCode,
      address: addressData,
    });

    if (!result.success) {
      setError(result.error || 'Failed to update address');
      setSaving(false);
      return;
    }

    setSaving(false);
    setIsEditing(false);
    router.refresh();
  };

  const handleCancel = () => {
    const address = profile.address || {};
    setFormData({
      country: address.country || '',
      city: address.city || '',
      postalCode: profile.postal_code || '',
      street: address.street || '',
    });
    setError(null);
    setIsEditing(false);
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
            Address
          </h4>

          {!isEditing ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Country
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {address.country || '-'}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  City
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {address.city || '-'}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Postal Code
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.postal_code || '-'}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Street
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {address.street || '-'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Country</Label>
                <Input
                  type="text"
                  defaultValue={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Enter country"
                />
              </div>

              <div>
                <Label>City</Label>
                <Input
                  type="text"
                  defaultValue={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                />
              </div>

              <div>
                <Label>Postal Code</Label>
                <Input
                  type="text"
                  defaultValue={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="e.g., 1000-001"
                />
              </div>

              <div>
                <Label>Street</Label>
                <Input
                  type="text"
                  defaultValue={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Enter street address"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto lg:flex-shrink-0">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:w-auto"
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
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
