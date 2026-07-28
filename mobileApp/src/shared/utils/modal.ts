export type AppModalVariant = 'success' | 'error' | 'warning' | 'info';

export type AppModalButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppModalButton = {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: AppModalButtonStyle;
};

export type AppModalOptions = {
  title: string;
  message?: string;
  variant?: AppModalVariant;
  buttons?: AppModalButton[];
  /** Tap outside card to close. Default false for confirmations. */
  dismissOnBackdrop?: boolean;
};

export type ShowConfirmModalOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

type ModalController = (options: AppModalOptions | null) => void;

let modalController: ModalController | null = null;

/** Wired by AppModalProvider on mount. */
export function registerModalController(controller: ModalController | null) {
  modalController = controller;
}

export function hideAppModal() {
  modalController?.(null);
}

/** Global alert replacement — works outside React components. */
export function showAppModal(options: AppModalOptions) {
  const buttons =
    options.buttons && options.buttons.length > 0
      ? options.buttons
      : [{ text: 'OK', style: 'default' as const }];

  modalController?.({
    dismissOnBackdrop: options.dismissOnBackdrop ?? buttons.length === 1,
    ...options,
    buttons,
  });
}

/** Two-button confirm / cancel dialog. */
export function showConfirmModal(options: ShowConfirmModalOptions) {
  const {
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    destructive = false,
    onConfirm,
    onCancel,
  } = options;

  showAppModal({
    title,
    message,
    variant: destructive ? 'warning' : 'info',
    dismissOnBackdrop: false,
    buttons: [
      { text: cancelText, style: 'cancel', onPress: onCancel },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ],
  });
}

export function showSuccessModal(
  title: string,
  message?: string,
  buttons?: AppModalButton[],
) {
  showAppModal({ title, message, variant: 'success', buttons });
}

export function showErrorModal(title: string, message?: string) {
  showAppModal({ title, message, variant: 'error' });
}
