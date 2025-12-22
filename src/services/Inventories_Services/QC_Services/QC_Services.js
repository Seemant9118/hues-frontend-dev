import { qcApis } from '@/api/inventories/qc/qc';
import { APIinstance } from '@/services';

export const getQCs = ({ page, limit }) => {
  return APIinstance.get(
    `${qcApis.getQCs.endpoint}?page=${page}&limit=${limit}`,
  );
};

export const getQCDetails = ({ id }) => {
  return APIinstance.get(`${qcApis.getQCDetails.endpoint}${id}`);
};

export const updateQC = ({ id, data }) => {
  return APIinstance.put(`${qcApis.updateQC.endpoint}${id}`, data);
};

export const getQCDetailsWithGRNs = ({ id }) => {
  return APIinstance.get(`${qcApis.getQCDetailsWithGRNs.endpoint}${id}`);
};

export const updateBulkQc = ({ data }) => {
  return APIinstance.put(`${qcApis.updateBulkQc.enpoint}`, data);
};
