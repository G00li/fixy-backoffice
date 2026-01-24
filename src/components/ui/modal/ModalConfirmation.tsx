"use client";
import React from "react";
import { Modal, ModalSize } from "./index";
import { ModalHeader } from "./ModalHeader";
import { ModalBody } from "./ModalBody";
import { ModalFooter } from "./ModalFooter";
import Button from "../button/Button";

interface ModalConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "danger";
  loading?: boolean;
  size?: ModalSize;
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export const ModalConfirmation: React.FC<ModalConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  loading = false,
  size = "sm",
  icon,
  iconBgColor,
  iconColor,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size}>
      <ModalHeader
        title={title}
        icon={icon}
        iconBgColor={iconBgColor}
        iconColor={iconColor}
      />
      <ModalBody>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className={
            confirmVariant === "danger"
              ? "bg-red-600 hover:bg-red-700"
              : ""
          }
        >
          {loading ? "Processing..." : confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
