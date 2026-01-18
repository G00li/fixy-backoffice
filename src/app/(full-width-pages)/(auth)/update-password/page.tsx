import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Update Password | Fixy Backoffice",
  description: "Set your new password",
};

export default function UpdatePassword() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <UpdatePasswordForm />
    </Suspense>
  );
}
