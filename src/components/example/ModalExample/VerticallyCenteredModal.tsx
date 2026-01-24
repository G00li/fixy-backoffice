"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/button/Button";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../ui/modal";
import { useModal } from "@/hooks/useModal";

export default function VerticallyCenteredModal() {
  const { isOpen, openModal, closeModal } = useModal();
  
  const handleSave = () => {
    console.log("Saving changes...");
    closeModal();
  };

  return (
    <ComponentCard title="Vertically Centered Modal">
      <Button size="sm" onClick={openModal}>
        Open Modal
      </Button>
      
      <Modal isOpen={isOpen} onClose={closeModal} size="sm" showCloseButton={false}>
        <ModalHeader
          title="All Done! Success Confirmed"
        />
        <ModalBody className="text-center">
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque euismod est quis mauris lacinia pharetra.
          </p>
        </ModalBody>
        <ModalFooter align="center">
          <Button size="sm" variant="outline" onClick={closeModal}>
            Close
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </ComponentCard>
  );
}
