"use client";
import React from "react";

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = "",
  noPadding = false,
}) => {
  return (
    <div className={`${noPadding ? "" : "px-6 py-4"} ${className}`}>
      {children}
    </div>
  );
};
