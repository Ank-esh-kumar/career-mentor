import hotToast from 'react-hot-toast';


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

    return hotToast.loading(msg, opts);
  },
  dismiss: (id) => {
    return hotToast.dismiss(id);
  },

  custom: (msg, opts) => {
    dispatchNotification('info', msg);
    return hotToast(msg, opts);
  }
};


const defaultToast = (msg, opts) => toast.custom(msg, opts);
Object.assign(defaultToast, toast);

export default defaultToast;
