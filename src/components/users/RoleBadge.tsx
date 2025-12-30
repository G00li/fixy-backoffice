interface RoleBadgeProps {
  role: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const roleConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  super_admin: {
    label: 'Super Admin',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  admin: {
    label: 'Admin',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  support: {
    label: 'Support',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  provider: {
    label: 'Provider',
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  client: {
    label: 'Client',
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export default function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  if (!role) {
    return (
      <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300`}>
        No Role
      </span>
    );
  }

  const config = roleConfig[role] || {
    label: role,
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  );
}
