import { notification } from 'antd';

export const parseError = (err) => {
  if (err.message) {
    notification.error({
      message: 'Error',
      description: err.message,
    });
  }
  notification.error({
    message: 'Error',
    description: err,
  });
}
