"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../ui/modal";
import Button from "../../ui/button/Button";
import { useModal } from "@/hooks/useModal";

export default function DefaultModal() {
  const { isOpen, openModal, closeModal } = useModal();
  
  const handleSave = () => {
    console.log("Saving changes...");
    closeModal();
  };

  return (
    <div>
      <ComponentCard title="Default Modal">
        <Button size="sm" onClick={openModal}>
          Open Modal
        </Button>
        
        <Modal isOpen={isOpen} onClose={closeModal} size="md">
          <ModalHeader
            title="Modal Heading"
          />
          <ModalBody>
            <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Pellentesque euismod est quis mauris lacinia pharetra. Sed a ligula
              ac odio condimentum aliquet a nec nulla. Aliquam bibendum ex sit
              amet ipsum rutrum feugiat ultrices enim quam.
            </p>
            <p className="mt-5 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Pellentesque euismod est quis mauris lacinia pharetra. Sed a ligula
              ac odio.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </ModalFooter>
        </Modal>
      </ComponentCard>
    </div>
  );
}
