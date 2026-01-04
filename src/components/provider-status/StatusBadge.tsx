import { StatusType, STATUS_TYPE_LABELS, STATUS_TYPE_COLORS } from '@/types/provider-status';

interface StatusBadgeProps {
  statusType: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function StatusBadge({
  statusType,
  size = 'md',
  showLabel = true,
  className = '',
}: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium
        ${STATUS_TYPE_COLORS[statusType]}
        ${sizeClasses[size]}
        ${className}`}
    >
      {showLabel && STATUS_TYPE_LABELS[statusType]}
    </span>
  );
}
