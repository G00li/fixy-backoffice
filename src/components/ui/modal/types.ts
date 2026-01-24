export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
export type AlertType = "info" | "warning" | "error" | "success";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface UserInfo {
  id: string;
  full_name: string | null;
  email: string | null;
  role?: string | null;
  avatar_url?: string | null;
}
