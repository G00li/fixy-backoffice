"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ResetPasswordModal from "./ResetPasswordModal";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/modal";
import Button from "../ui/button/Button";
import { resetUserPasswordByAdmin } from "@/app/actions/users";
import { copyToClipboard } from "@/lib/password-generator";

interface ResetPasswordButtonProps {
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
  };
  currentUserRole: string | null;
}

export default function ResetPasswordButton({ user, currentUserRole }: ResetPasswordButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Only super_admin can see this button
  if (currentUserRole !== 'super_admin') {
    return null;
  }

  // Cannot reset password of another super_admin
  if (user.role === 'super_admin') {
    return null;
  }

  const handleResetPassword = async (password: string, isTemporary: boolean) => {
    setError(null);
    
    const result = await resetUserPasswordByAdmin({
      targetUserId: user.id,
      newPassword: password,
      generateTemporary: isTemporary,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to reset password');
    }

    setIsModalOpen(false);

    // If it was a temporary password, show it in the modal
    if (isTemporary) {
      setTemporaryPassword(password);
      setShowTempPasswordModal(true);
    } else {
      // Show success message for custom password
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 3000);
    }
  };

  const handleCopyPassword = async () => {
    if (temporaryPassword) {
      const success = await copyToClipboard(temporaryPassword);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleCloseTempPasswordModal = () => {
    setShowTempPasswordModal(false);
    setTemporaryPassword(null);
    setCopied(false);
    router.refresh();
  };

  return (
    <>
      {/* Success notification for custom password */}
      {success && (
        <div className="fixed top-4 right-4 z-999999 rounded-lg bg-green-50 p-4 shadow-lg dark:bg-green-900/20">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Password reset successfully
              </p>
              <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                The user has been notified and logged out from all devices
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Password Display Modal */}
      <Modal
        isOpen={showTempPasswordModal}
        onClose={handleCloseTempPasswordModal}
        size="sm"
        closeOnBackdrop={false}
      >
        <ModalHeader
          title="Temporary Password Generated"
          subtitle="Save this password securely"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />

        <ModalBody>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            Temporary password for <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>:
          </p>
          <div className="rounded-lg border-2 border-dashed border-brand-300 bg-brand-50 p-4 dark:border-brand-700 dark:bg-brand-900/20">
            <code className="block break-all font-mono text-lg font-semibold text-brand-900 dark:text-brand-100">
              {temporaryPassword}
            </code>
          </div>
          <button
            onClick={handleCopyPassword}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            {copied ? (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied to Clipboard!
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </>
            )}
          </button>

          <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-900/20">
            <div className="flex gap-3">
              <svg className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  Important:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-orange-700 dark:text-orange-400">
                  <li>• This password will only be shown once</li>
                  <li>• User must change it on first login</li>
                  <li>• User has been notified via email</li>
                </ul>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button onClick={handleCloseTempPasswordModal} className="w-full">
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reset Password Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center rounded-lg border border-orange-300 bg-white px-4 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-50 dark:border-orange-700 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
      >
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        Reset Password
      </button>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleResetPassword}
        user={user}
      />
    </>
  );
}
