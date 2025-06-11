import { auditLogsAPIs } from '@/api/auditLogs/auditLogsApi';
import { APIinstance } from '@/services';

export const getOrderAudits = (orderId) => {
  return APIinstance.get(`${auditLogsAPIs.getOrderAudits.endpoint}${orderId}`);
};
