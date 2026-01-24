export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-r-transparent"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    </div>
  );
}
