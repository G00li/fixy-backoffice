"use client";
import React from "react";

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = "",
  align = "right",
}) => {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div
      className={`flex items-center gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700 ${alignClasses[align]} ${className}`}
    >
      {children}
    </div>
  );
};
