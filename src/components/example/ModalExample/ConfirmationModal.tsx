"use client";
import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/button/Button";
import { ModalConfirmation } from "../../ui/modal";
import { useModal } from "@/hooks/useModal";

export default function ConfirmationModal() {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    closeModal();
    alert("Action confirmed!");
  };

  return (
    <ComponentCard title="Confirmation Modal">
      <Button size="sm" onClick={openModal} className="bg-red-600 hover:bg-red-700">
        Delete Item
      </Button>

      <ModalConfirmation
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Yes, delete"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={loading}
        size="sm"
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        }
        iconBgColor="bg-red-100 dark:bg-red-900/30"
        iconColor="text-red-600 dark:text-red-400"
      />
    </ComponentCard>
  );
}
