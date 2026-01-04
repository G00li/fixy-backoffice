import toast from 'react-hot-toast';

// Custom toast configurations
const toastConfig = {
  success: {
    duration: 3000,
    style: {
      background: '#10B981',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  },
  error: {
    duration: 4000,
    style: {
      background: '#EF4444',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
    },
  },
  loading: {
    style: {
      background: '#3B82F6',
      color: '#fff',
    },
  },
};

// Helper functions for consistent toast messages
export const showToast = {
  success: (message: string) => {
    toast.success(message, toastConfig.success);
  },
  
  error: (message: string) => {
    toast.error(message, toastConfig.error);
  },
  
  loading: (message: string) => {
    return toast.loading(message, toastConfig.loading);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages, {
      success: toastConfig.success,
      error: toastConfig.error,
      loading: toastConfig.loading,
    });
  },
  
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

// Specific toast messages for common actions
export const toastMessages = {
  status: {
    updated: 'Status atualizado com sucesso',
    updateError: 'Erro ao atualizar status',
    autoChanged: (newStatus: string) => `Status alterado automaticamente para ${newStatus}`,
  },
  schedule: {
    saved: 'Horário salvo com sucesso',
    saveError: 'Erro ao salvar horário',
    deleted: 'Horário removido com sucesso',
    deleteError: 'Erro ao remover horário',
  },
  auth: {
    signInSuccess: 'Login realizado com sucesso',
    signInError: 'Erro ao fazer login',
    signOutSuccess: 'Logout realizado com sucesso',
    unauthorized: 'Você não tem permissão para esta ação',
  },
  general: {
    saveSuccess: 'Salvo com sucesso',
    saveError: 'Erro ao salvar',
    deleteSuccess: 'Removido com sucesso',
    deleteError: 'Erro ao remover',
    updateSuccess: 'Atualizado com sucesso',
    updateError: 'Erro ao atualizar',
  },
};
