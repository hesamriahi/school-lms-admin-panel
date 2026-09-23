import { toast } from 'react-toastify';

class ToastrNotification {
  static success(message: string, duration:number = 2000) {
    toast.success(message, {
      autoClose: duration // milliseconds
    });
  }

  static warning(message: string, duration:number = 2000) {
    toast.warning(message, {
      autoClose: duration // milliseconds
    });
  }

  static info(message: string, duration:number = 2000) {
    toast.info(message, {
      autoClose: duration // milliseconds
    });
  }

  static error(message: string, duration:number = 2000) {
    toast.error(message, {
      autoClose: duration // milliseconds
    });
  }
}

export default ToastrNotification;
