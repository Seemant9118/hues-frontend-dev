import { dashboardApis } from '@/api/dashboard/dashboardApi';
import { APIinstance } from '@/services';
import moment from 'moment';

const buildQueryParams = (viewType, dateRange) => {
  const params = new URLSearchParams();
  if (viewType) params.append('viewType', viewType);
  if (dateRange?.[0] && dateRange?.[1]) {
    params.append('fromDate', moment(dateRange[0]).format('YYYY/MM/DD'));
    params.append('toDate', moment(dateRange[1]).format('YYYY/MM/DD'));
  }
  return params.toString();
};

export const getSalesAnalytics = (viewType, dateRange) => {
  if (!dateRange?.[0] || !dateRange?.[1]) return Promise.resolve(null); // Skip API call
  const query = buildQueryParams(viewType, dateRange);
  return APIinstance.get(`${dashboardApis.getSalesAnalysis.endpoint}?${query}`);
};

export const getPurchaseAnalytics = (viewType, dateRange) => {
  if (!dateRange?.[0] || !dateRange?.[1]) return Promise.resolve(null); // Skip API call
  const query = buildQueryParams(viewType, dateRange);
  return APIinstance.get(
    `${dashboardApis.getPurchaseAnalysis.endpoint}?${query}`,
  );
};
