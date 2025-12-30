'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserDetail, updateUser, updateUserRole } from '@/app/actions/users';
import RoleBadge from '@/components/users/RoleBadge';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const userId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bio: '',
    role: '' as string,
  });

  const [originalRole, setOriginalRole] = useState('');

  useEffect(() => {
    async function loadUser() {
      const result = await getUserDetail(userId);
      
      if (result.success && result.user) {
        setFormData({
          fullName: result.user.full_name || '',
          phone: result.user.phone || '',
          bio: result.user.bio || '',
          role: result.user.role as any,
        });
        setOriginalRole(result.user.role || '');
      } else {
        setError(result.error || 'Failed to load user');
      }
      
      setLoading(false);
    }

    loadUser();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    // Update profile
    const profileResult = await updateUser({
      userId,
      fullName: formData.fullName,
      phone: formData.phone,
      bio: formData.bio,
    });

    if (!profileResult.success) {
      setError(profileResult.error || 'Failed to update user');
      setSaving(false);
      return;
    }

    // Update role if changed
    if (formData.role !== originalRole) {
      const roleResult = await updateUserRole({
        userId,
        newRole: formData.role,
      });

      if (!roleResult.success) {
        setError(roleResult.error || 'Failed to update role');
        setSaving(false);
        return;
      }
    }

    setSuccess('User updated successfully');
    setSaving(false);
    
    // Redirect after 1 second
    setTimeout(() => {
      router.push(`/users/${userId}`);
      router.refresh();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/users/${userId}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to User Details
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Edit User
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Update user information and role
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            disabled={saving}
            rows={4}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            placeholder="Tell us about this user..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="support">Support</option>
            <option value="admin">Admin</option>
            <option value="provider">Provider</option>
            <option value="client">Client</option>
          </select>
          {formData.role !== originalRole && (
            <div className="mt-2 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <div className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Role Change Detected
                  </p>
                  <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                    Changing from <RoleBadge role={originalRole} size="sm" /> to{' '}
                    <RoleBadge role={formData.role} size="sm" />. The user will be notified.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-brand-500 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving Changes...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
          <Link
            href={`/users/${userId}`}
            className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-center font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
