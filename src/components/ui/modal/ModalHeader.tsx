"use client";
import React from "react";

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  onClose?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconBgColor = "bg-brand-100 dark:bg-brand-900/30",
  iconColor = "text-brand-600 dark:text-brand-400",
}) => {
  return (
    <div className="flex items-start gap-3 p-6 pb-4">
      {icon && (
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconBgColor}`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
