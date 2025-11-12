import { fcmAPIs } from '@/api/fcmApis/fcmApis';
import axios from 'axios';

export const deregisterFcmToken = (data) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_BASE_URL}${fcmAPIs.deregisterFcmToken.endpoint}`,
    data,
  );
};
