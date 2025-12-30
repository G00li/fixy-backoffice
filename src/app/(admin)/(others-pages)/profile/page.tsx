"use client";
import { getCurrentUserProfile } from "@/app/actions/users";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileTabs from "@/components/user-profile/ProfileTabs";
import GeneralTab from "@/components/user-profile/GeneralTab";
import SecurityTab from "@/components/user-profile/SecurityTab";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const result = await getCurrentUserProfile();
      
      if (!result.success || !result.profile) {
        redirect('/signin');
        return;
      }

      setProfile(result.profile);
      setLoading(false);
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: "security",
      label: "Security",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        
        <ProfileTabs tabs={tabs} defaultTab="general">
          <div data-tab="general">
            <GeneralTab profile={profile} />
          </div>
          <div data-tab="security">
            <SecurityTab />
          </div>
        </ProfileTabs>
      </div>
    </div>
  );
}
