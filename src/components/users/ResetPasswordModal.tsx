"use client";
import { useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { generateSecurePassword, copyToClipboard } from "@/lib/password-generator";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalAlert,
  ModalUserInfo,
} from "../ui/modal";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string, isTemporary: boolean) => Promise<void>;
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
  };
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  onConfirm,
  user,
}: ResetPasswordModalProps) {
  const [passwordMode, setPasswordMode] = useState<'custom' | 'temporary'>('custom');
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 8) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    
    let strength = 1;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 2, label: 'Fair', color: 'bg-orange-500' };
    if (strength <= 3) return { strength: 3, label: 'Good', color: 'bg-yellow-500' };
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleGeneratePassword = () => {
    const password = generateSecurePassword(16);
    setGeneratedPassword(password);
  };

  const handleCopyPassword = async () => {
    const success = await copyToClipboard(generatedPassword);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (passwordMode === 'custom') {
      if (!newPassword || !confirmPassword) {
        setError('All fields are required');
        return;
      }

      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else {
      if (!generatedPassword) {
        setError('Please generate a temporary password first');
        return;
      }
    }

    if (!confirmed) {
      setError('Please confirm that you want to reset this user\'s password');
      return;
    }

    setLoading(true);

    try {
      if (passwordMode === 'temporary') {
        // Send the generated password and mark it as temporary
        await onConfirm(generatedPassword, true);
      } else {
        // Send custom password (not temporary)
        await onConfirm(newPassword, false);
      }
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPasswordMode('custom');
    setNewPassword('');
    setConfirmPassword('');
    setGeneratedPassword('');
    setConfirmed(false);
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" closeOnBackdrop={false}>
      <ModalHeader
        title="Reset User Password"
        subtitle="This action requires confirmation"
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
        iconBgColor="bg-orange-100 dark:bg-orange-900/30"
        iconColor="text-orange-600 dark:text-orange-400"
      />

      <ModalBody>
        {/* User Info */}
        <ModalUserInfo
          user={user}
          description="You are about to reset the password for:"
          className="mb-6"
        />

        {/* Password Mode Selection */}
        <div className="mb-6">
          <Label>Password Options</Label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/50">
              <input
                type="radio"
                name="passwordMode"
                value="custom"
                checked={passwordMode === 'custom'}
                onChange={() => setPasswordMode('custom')}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Set custom password
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Define a specific password for the user
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/50">
              <input
                type="radio"
                name="passwordMode"
                value="temporary"
                checked={passwordMode === 'temporary'}
                onChange={() => {
                  setPasswordMode('temporary');
                  if (!generatedPassword) {
                    handleGeneratePassword();
                  }
                }}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Generate temporary password
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  User must change on first login
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <ModalAlert type="error" className="mb-4">
            {error}
          </ModalAlert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {passwordMode === 'custom' ? (
            <>
              {/* Custom Password Fields */}
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Password strength:
                      </span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.strength === 1 ? 'text-red-600 dark:text-red-400' :
                        passwordStrength.strength === 2 ? 'text-orange-600 dark:text-orange-400' :
                        passwordStrength.strength === 3 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Passwords do not match
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Temporary Password Display */}
              <div>
                <Label>Generated Temporary Password</Label>
                <div className="mt-2 rounded-lg border-2 border-dashed border-brand-300 bg-brand-50 p-4 dark:border-brand-700 dark:bg-brand-900/20">
                  <div className="flex items-center justify-between gap-3">
                    <code className="flex-1 font-mono text-lg font-semibold text-brand-900 dark:text-brand-100 break-all">
                      {generatedPassword || 'Click generate to create password'}
                    </code>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
                        title="Generate new password"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        disabled={!generatedPassword}
                        className="flex items-center gap-2 rounded-lg bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  ⚠️ Make sure to copy this password before closing. The user will need to change it on first login.
                </p>
              </div>
            </>
          )}

          {/* Warning */}
          <ModalAlert type="warning" title="Warning: This action will:" className="mb-4">
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Immediately change the user's password</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Log out the user from all devices</span>
              </li>
              {passwordMode === 'temporary' && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>Force user to change password on next login</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Send a notification to the user</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Be recorded in the audit log</span>
              </li>
            </ul>
          </ModalAlert>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
            <input
              type="checkbox"
              id="confirm-reset"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label htmlFor="confirm-reset" className="text-sm text-gray-700 dark:text-gray-300">
              I confirm that I want to reset this user's password and understand that this action will be logged
            </label>
          </div>
        </form>
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={
            loading || 
            !confirmed || 
            (passwordMode === 'custom' && (!newPassword || !confirmPassword || newPassword !== confirmPassword)) ||
            (passwordMode === 'temporary' && !generatedPassword)
          }
          className="bg-orange-600 hover:bg-orange-700"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
