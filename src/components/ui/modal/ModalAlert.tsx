"use client";
import React from "react";

export type AlertType = "info" | "warning" | "error" | "success";

interface ModalAlertProps {
  type: AlertType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const alertStyles: Record<
  AlertType,
  {
    container: string;
    icon: string;
    iconBg: string;
    title: string;
    text: string;
  }
> = {
  info: {
    container: "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    title: "text-blue-800 dark:text-blue-300",
    text: "text-blue-700 dark:text-blue-400",
  },
  warning: {
    container: "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/20",
    icon: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    title: "text-orange-800 dark:text-orange-300",
    text: "text-orange-700 dark:text-orange-400",
  },
  error: {
    container: "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20",
    icon: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    title: "text-red-800 dark:text-red-300",
    text: "text-red-700 dark:text-red-400",
  },
  success: {
    container: "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20",
    icon: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    title: "text-green-800 dark:text-green-300",
    text: "text-green-700 dark:text-green-400",
  },
};

const alertIcons: Record<AlertType, React.ReactNode> = {
  info: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export const ModalAlert: React.FC<ModalAlertProps> = ({
  type,
  title,
  children,
  className = "",
}) => {
  const styles = alertStyles[type];

  return (
    <div className={`rounded-lg border p-4 ${styles.container} ${className}`}>
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {alertIcons[type]}
        </div>
        <div className="flex-1">
          {title && (
            <p className={`text-sm font-medium ${styles.title}`}>
              {title}
            </p>
          )}
          <div className={`text-sm ${title ? "mt-2" : ""} ${styles.text}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
