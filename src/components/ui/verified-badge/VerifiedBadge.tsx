"use client";
import React from "react";
import Badge from "../badge/Badge";

interface VerifiedBadgeProps {
  isVerified: boolean;
  verifiedAt?: string | null;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  isVerified,
  verifiedAt,
  size = "md",
  showLabel = true,
}) => {
  if (!isVerified) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const VerifiedIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0C8.36819 0 8.70883 0.193646 8.89443 0.505573L10.382 2.76393L13.0557 3.16853C13.4201 3.22216 13.7274 3.46904 13.8642 3.81259C14.001 4.15614 13.9483 4.54615 13.7254 4.84L12.0508 7L13.7254 9.16C13.9483 9.45385 14.001 9.84386 13.8642 10.1874C13.7274 10.531 13.4201 10.7778 13.0557 10.8315L10.382 11.2361L8.89443 13.4944C8.70883 13.8064 8.36819 14 8 14C7.63181 14 7.29117 13.8064 7.10557 13.4944L5.61803 11.2361L2.94426 10.8315C2.57993 10.7778 2.27264 10.531 2.13583 10.1874C1.99902 9.84386 2.05174 9.45385 2.27459 9.16L3.94918 7L2.27459 4.84C2.05174 4.54615 1.99902 4.15614 2.13583 3.81259C2.27264 3.46904 2.57993 3.22216 2.94426 3.16853L5.61803 2.76393L7.10557 0.505573C7.29117 0.193646 7.63181 0 8 0ZM11.0303 5.96967C11.3232 6.26256 11.3232 6.73744 11.0303 7.03033L7.53033 10.5303C7.23744 10.8232 6.76256 10.8232 6.46967 10.5303L4.96967 9.03033C4.67678 8.73744 4.67678 8.26256 4.96967 7.96967C5.26256 7.67678 5.73744 7.67678 6.03033 7.96967L7 8.93934L9.96967 5.96967C10.2626 5.67678 10.7374 5.67678 11.0303 5.96967Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <div className="inline-flex items-center gap-1" title={verifiedAt ? `Verified on ${formatDate(verifiedAt)}` : "Verified"}>
      <Badge variant="solid" color="success" size={size} startIcon={<VerifiedIcon />}>
        {showLabel && "Verified"}
      </Badge>
    </div>
  );
};

export default VerifiedBadge;
