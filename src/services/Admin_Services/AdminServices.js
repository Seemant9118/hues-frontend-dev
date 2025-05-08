import { AdminAPIs } from '@/api/adminApi/AdminApi';
import { APIinstance } from '@/services';

export const getAdminData = (dateRange) => {
  const [startDate, endDate] = dateRange;

  return APIinstance.post(`${AdminAPIs.getAdminData.endpoint}`, {
    startDate,
    endDate,
  });
};
