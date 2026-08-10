import hotToast from 'react-hot-toast';

// Helper to dispatch custom events to the NotificationContext
const dispatchNotification = (type, message) => {
  window.dispatchEvent(
    new CustomEvent('app-notification', {
      detail: {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        type,
        message,
        timestamp: new Date().toISOString(),
      },
    })
  );
};

// Custom toast object mimicking react-hot-toast API
const toast = {
  success: (msg, opts) => {
    dispatchNotification('success', msg);
    return hotToast.success(msg, opts);
  },
  error: (msg, opts) => {
    dispatchNotification('error', msg);
    return hotToast.error(msg, opts);
  },
  loading: (msg, opts) => {
    // We might not want to store loading toasts in history, but we still trigger them visually
    return hotToast.loading(msg, opts);
  },
  dismiss: (id) => {
    return hotToast.dismiss(id);
  },
  // Default generic toast
  custom: (msg, opts) => {
    dispatchNotification('info', msg);
    return hotToast(msg, opts);
  }
};

// Make the default export act like a function too, just like standard toast('message')
const defaultToast = (msg, opts) => toast.custom(msg, opts);
Object.assign(defaultToast, toast);

export default defaultToast;
