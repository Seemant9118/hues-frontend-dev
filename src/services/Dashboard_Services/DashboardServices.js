import { dashboardApis } from '@/api/dashboard/dashboardApi';
import { APIinstance } from '@/services';

export const getSalesAnalytics = (viewType) => {
  return APIinstance.get(
    `${dashboardApis.getSalesAnalysis.endpoint}?viewType=${viewType}`,
  );
};

export const getPurchaseAnalytics = (viewType) => {
  return APIinstance.get(
    `${dashboardApis.getPurchaseAnalysis.endpoint}?viewType=${viewType}`,
  );
};
