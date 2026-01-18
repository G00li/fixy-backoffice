import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserNotificationPreferences } from '@/app/actions/notifications';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';

export default async function NotificationSettingsPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user preferences
  const result = await getUserNotificationPreferences({
    user_id: user.id,
  });

  if (!result.success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            Erro ao carregar preferências: {result.error}
          </p>
        </div>
      </div>
    );
  }

  const preferences = result.preferences || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Preferências de Notificações
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure como e quando você deseja receber notificações
        </p>
      </div>

      {/* Info Card */}
      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
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
            <p className="font-medium mb-1">Como funcionam as preferências</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
              <li>Ative ou desative cada tipo de notificação individualmente</li>
              <li>Escolha os canais de entrega (in-app, email, push)</li>
              <li>Configure horários de silêncio para não ser incomodado</li>
              <li>As alterações são salvas automaticamente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Tipos de Notificação
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie suas preferências para cada tipo de notificação
          </p>
        </div>

        <NotificationPreferences userId={user.id} initialPreferences={preferences} />
      </div>

      {/* Tips Card */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium mb-1">Dicas Úteis</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
              <li>
                <strong>Horário de Silêncio:</strong> Durante este período, você não receberá
                notificações em nenhum canal. Ideal para horário de sono.
              </li>
              <li>
                <strong>Canais:</strong> Você pode escolher receber notificações apenas no app,
                apenas por email, ou em múltiplos canais.
              </li>
              <li>
                <strong>Notificações Importantes:</strong> Recomendamos manter ativas as
                notificações de "Alertas de Segurança" e "Atenção Necessária".
              </li>
              <li>
                <strong>Promoções:</strong> Se não quiser receber ofertas e promoções, você pode
                desativar o tipo "Promoções" e "Campanhas".
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <a
          href="/notifications"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          Ver Notificações
        </a>

        <a
          href="/settings"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Outras Configurações
        </a>
      </div>
    </div>
  );
}
