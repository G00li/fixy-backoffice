"use client";
import React from "react";

interface ModalUserInfoProps {
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
    role?: string | null;
    avatar_url?: string | null;
  };
  description?: string;
  className?: string;
}

export const ModalUserInfo: React.FC<ModalUserInfoProps> = ({
  user,
  description,
  className = "",
}) => {
  const initials = user.full_name?.charAt(0).toUpperCase() || 
                   user.email?.charAt(0).toUpperCase() || 
                   'U';

  return (
    <div className={`rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50 ${className}`}>
      {description && (
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      <div className="flex items-center gap-3">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name || 'User'}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
            <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
              {initials}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {user.full_name || 'No name'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {user.email}
          </p>
        </div>
      </div>
      {user.role && (
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
            {user.role}
          </span>
        </div>
      )}
    </div>
  );
};
