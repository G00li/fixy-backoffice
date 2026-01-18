"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [sessionError, setSessionError] = useState("");

  // Verify and establish session from recovery token
  useEffect(() => {
    const verifySession = async () => {
      const supabase = createClient();
      
      // Check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsVerifying(false);
        return;
      }

      // If no session, check for error in URL (token expired or invalid)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const errorCode = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      if (errorCode) {
        setSessionError(errorDescription || 'Invalid or expired reset link');
        setIsVerifying(false);
        return;
      }

      // No session and no error means the link hasn't been processed yet
      // Wait a bit for Supabase to process the token
      setTimeout(async () => {
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (!newSession) {
          setSessionError('Invalid or expired reset link. Please request a new password reset.');
        }
        setIsVerifying(false);
      }, 1000);
    };

    verifySession();
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await updatePassword(password);

      if (!result.success) {
        setError(result.error || "Failed to update password");
        setLoading(false);
        return;
      }

      // Success - redirect to signin
      router.push("/signin?message=Password updated successfully");
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (pwd.length === 0) return { label: "", color: "", width: "0%" };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { label: "Weak", color: "bg-red-500", width: "33%" };
    if (strength <= 3) return { label: "Medium", color: "bg-yellow-500", width: "66%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };

  const passwordStrength = getPasswordStrength(password);

  // Show loading while verifying session
  if (isVerifying) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mb-4"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Verifying reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if session couldn't be established
  if (sessionError) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
            <div className="flex items-center gap-3 mb-3">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Invalid Reset Link
              </h2>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              {sessionError}
            </p>
            <a
              href="/reset-password"
              className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition w-full px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
            >
              Request new reset link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Set New Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your new password below. Make sure it&apos;s strong and secure.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}
              <div>
                <Label htmlFor="password">
                  New Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <span
                    onClick={() => !loading && setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Password strength:
                      </span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.label === "Weak" ? "text-red-600 dark:text-red-400" :
                        passwordStrength.label === "Medium" ? "text-yellow-600 dark:text-yellow-400" :
                        "text-green-600 dark:text-green-400"
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <span
                    onClick={() => !loading && setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition w-full px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
