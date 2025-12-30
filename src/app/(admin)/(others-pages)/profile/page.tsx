import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { getCurrentUserProfile } from "@/app/actions/users";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Profile | Fixy Backoffice",
  description: "Manage your profile information",
};

export default async function Profile() {
  // Get current user profile
  const result = await getCurrentUserProfile();

  if (!result.success || !result.profile) {
    redirect('/signin');
  }

  const profile = result.profile;

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard profile={profile} />
          <UserInfoCard profile={profile} />
          <UserAddressCard profile={profile} />
        </div>
      </div>
    </div>
  );
}
