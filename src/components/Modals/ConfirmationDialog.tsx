import React from 'react';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  onTop?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  text = 'آیا مطمئن هستید؟',
  confirmText = 'بله',
  cancelText = 'خیر',
  onTop = true
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} onTop={onTop} className="max-w-[500px] p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-md  text-gray-800 dark:text-white/90">
            {text}
          </h3>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
