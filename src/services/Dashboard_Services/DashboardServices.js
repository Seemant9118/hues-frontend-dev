import { dashboardApis } from '@/api/dashboard/dashboardApi';
import { APIinstance } from '@/services';

export const getSalesAnalytics = (data) => {
  return APIinstance.post(dashboardApis.getSalesAnalysis.endpoint, data);
};

export const getPurchaseAnalytics = (data) => {
  return APIinstance.post(dashboardApis.getPurchaseAnalysis.endpoint, data);
};
