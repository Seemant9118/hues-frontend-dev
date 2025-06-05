import { AdminAPIs } from '@/api/adminApi/AdminApi';
import { APIinstance } from '@/services';

export const getAdminData = (dateRange) => {
  const [startDate, endDate] = dateRange;

  return APIinstance.post(`${AdminAPIs.getAdminData.endpoint}`, {
    startDate,
    endDate,
  });
};

export const getEnterprisesData = ({ page, limit }) => {
  return APIinstance.get(
    `${AdminAPIs.getEnterpriseData.endpoint}?page=${page}&limit=${limit}`,
  );
};

export const getOnboardingData = ({ page, limit }) => {
  return APIinstance.get(
    `${AdminAPIs.getOnboardingData.endpoint}?page=${page}&limit=${limit}`,
  );
};
