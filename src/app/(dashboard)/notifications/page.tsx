import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  getNotifications,
  getNotificationStats,
  markAllNotificationsAsRead,
} from '@/app/actions/notifications';
import NotificationFilters from '@/components/notifications/NotificationFilters';
import NotificationPageClient from './NotificationPageClient';
import { NotificationPriority } from '@/types/notifications';
import Link from 'next/link';

interface SearchParams {
  page?: string;
  priority?: string;
  type?: string;
  unread?: string;
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const priority = params.priority as NotificationPriority | undefined;
  const type = params.type || undefined;
  const unreadOnly = params.unread === 'true';

  const limit = 20;
  const offset = (page - 1) * limit;

  // Fetch notifications
  const notificationsResult = await getNotifications({
    user_id: user.id,
    unread_only: unreadOnly,
    priority,
    notification_type: type,
    limit,
    offset,
  });

  // Fetch stats
  const statsResult = await getNotificationStats(user.id);

  if (!notificationsResult.success) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            Erro ao carregar notificações: {notificationsResult.error}
          </p>
        </div>
      </div>
    );
  }

  const notifications = notificationsResult.notifications || [];
  const stats = statsResult.success ? statsResult.stats : null;

  // Calculate total pages
  const totalNotifications = stats?.total || 0;
  const totalPages = Math.ceil(totalNotifications / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Notificações
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie suas notificações e mantenha-se atualizado
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.total || 0}
              </p>
            </div>
            <div className="p-3 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
              <svg
                className="w-6 h-6 text-brand-600 dark:text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Unread */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Não Lidas</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.unread || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alta Prioridade</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats?.by_priority?.high || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Urgent */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Urgentes</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats?.by_priority?.urgent || 0}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <NotificationPageClient
          userId={user.id}
          initialNotifications={notifications}
          unreadCount={stats?.unread || 0}
        />
      </div>

      {/* Notifications List Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Nenhuma notificação encontrada
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {unreadOnly
                ? 'Você não tem notificações não lidas no momento'
                : priority || type
                ? 'Tente ajustar os filtros para ver mais notificações'
                : 'Você está em dia com suas notificações'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationPageClient
                key={notification.id}
                userId={user.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between rounded-lg bg-white px-4 py-4 shadow dark:bg-gray-800 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            {page > 1 && (
              <Link
                href={`/notifications?page=${page - 1}${priority ? `&priority=${priority}` : ''}${type ? `&type=${type}` : ''}${unreadOnly ? '&unread=true' : ''}`}
                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/notifications?page=${page + 1}${priority ? `&priority=${priority}` : ''}${type ? `&type=${type}` : ''}${unreadOnly ? '&unread=true' : ''}`}
                className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Próxima
              </Link>
            )}
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Página <span className="font-medium text-gray-800 dark:text-white/90">{page}</span> de{' '}
                <span className="font-medium text-gray-800 dark:text-white/90">{totalPages}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/notifications?page=${page - 1}${priority ? `&priority=${priority}` : ''}${type ? `&type=${type}` : ''}${unreadOnly ? '&unread=true' : ''}`}
                  className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                  <span className="sr-only">Anterior</span>
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
                    href={`/notifications?page=${pageNum}${priority ? `&priority=${priority}` : ''}${type ? `&type=${type}` : ''}${unreadOnly ? '&unread=true' : ''}`}
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
                  href={`/notifications?page=${page + 1}${priority ? `&priority=${priority}` : ''}${type ? `&type=${type}` : ''}${unreadOnly ? '&unread=true' : ''}`}
                  className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                  <span className="sr-only">Próxima</span>
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

      {/* Help Box */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Sobre as Notificações</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
              <li><strong>Urgente:</strong> Requer ação imediata</li>
              <li><strong>Alta:</strong> Importante, mas não urgente</li>
              <li><strong>Média:</strong> Informação relevante</li>
              <li><strong>Baixa:</strong> Informação geral</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
