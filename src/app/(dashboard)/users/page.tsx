import { Suspense } from 'react';
import Link from 'next/link';
import { getUserList } from '@/app/actions/users';
import RoleBadge from '@/components/users/RoleBadge';
import AuthGuard from '@/components/auth/AuthGuard';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import Image from 'next/image';

interface SearchParams {
  page?: string;
  search?: string;
  role?: string;
}

async function UserListContent({ searchParams }: { searchParams: SearchParams }) {
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const role = searchParams.role || '';

  const result = await getUserList({
    page,
    search,
    role: role || undefined,
  });

  if (!result.success) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">
          {result.error || 'Failed to load users'}
        </p>
      </div>
    );
  }

  const { users = [], total = 0, totalPages = 1 } = result;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              User Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage users, roles, and permissions
            </p>
          </div>
          <Link href="/users/new">
            <Button
              size="md"
              variant="primary"
              startIcon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            >
              Create User
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Card */}
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <form className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              name="role"
              defaultValue={role}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="support">Support</option>
              <option value="provider">Provider</option>
              <option value="client">Client</option>
            </select>
          </div>
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <svg
              className="h-5 w-5 stroke-current"
              fill="none"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filter
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-800 dark:text-white/90">{users.length}</span> of{' '}
          <span className="font-medium text-gray-800 dark:text-white/90">{total}</span> users
        </p>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.length === 0 ? (
                <TableRow>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No users found
                    </p>
                  </td>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                          {user.avatar_url ? (
                            <Image
                              width={40}
                              height={40}
                              src={user.avatar_url}
                              alt={user.full_name || 'User'}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                              <span className="text-sm font-medium text-brand-500 dark:text-brand-400">
                                {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {user.full_name || 'No name'}
                          </p>
                          <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user.phone || '-'}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-end">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/users/${user.id}`}
                          className="text-theme-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          View
                        </Link>
                        <Link
                          href={`/users/${user.id}/edit`}
                          className="text-theme-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          Edit
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            {page > 1 && (
              <Link
                href={`/users?page=${page - 1}${search ? `&search=${search}` : ''}${role ? `&role=${role}` : ''}`}
                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/users?page=${page + 1}${search ? `&search=${search}` : ''}${role ? `&role=${role}` : ''}`}
                className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Next
              </Link>
            )}
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page <span className="font-medium text-gray-800 dark:text-white/90">{page}</span> of{' '}
                <span className="font-medium text-gray-800 dark:text-white/90">{totalPages}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/users?page=${page - 1}${search ? `&search=${search}` : ''}${role ? `&role=${role}` : ''}`}
                  className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              )}
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <Link
                    key={pageNum}
                    href={`/users?page=${pageNum}${search ? `&search=${search}` : ''}${role ? `&role=${role}` : ''}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-brand-500 text-white'
                        : 'text-gray-700 hover:bg-brand-50 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-400'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {page < totalPages && (
                <Link
                  href={`/users?page=${page + 1}${search ? `&search=${search}` : ''}${role ? `&role=${role}` : ''}`}
                  className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  return (
    <AuthGuard allowedRoles={['super_admin', 'admin']}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-r-transparent"></div>
          </div>
        }
      >
        <UserListContent searchParams={params} />
      </Suspense>
    </AuthGuard>
  );
}
