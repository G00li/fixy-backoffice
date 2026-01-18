import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password | Fixy Backoffice",
  description: "Reset your password to access the Fixy admin panel",
};

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
