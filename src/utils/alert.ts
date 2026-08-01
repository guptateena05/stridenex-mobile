import { Alert as RNAlert, AlertButton, AlertOptions } from 'react-native';

let isAlertShowing = false;

export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) => {
    if (isAlertShowing) {
      console.log(`[Alert Suppressed] ${title}: ${message}`);
      return;
    }

    isAlertShowing = true;

    const wrappedButtons = buttons && buttons.length > 0
      ? buttons.map(button => ({
          ...button,
          onPress: (value?: any) => {
            isAlertShowing = false;
            if (button.onPress) {
              button.onPress(value);
            }
          }
        }))
      : [
          {
            text: 'OK',
            onPress: () => {
              isAlertShowing = false;
            }
          }
        ];

    const wrappedOptions = {
      ...options,
      onDismiss: () => {
        isAlertShowing = false;
        if (options?.onDismiss) {
          options.onDismiss();
        }
      }
    };

    RNAlert.alert(title, message, wrappedButtons, wrappedOptions);
  }
};
