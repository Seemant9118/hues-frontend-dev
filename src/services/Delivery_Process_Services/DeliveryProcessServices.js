import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { APIinstance } from '@/services';

export const createDispatchNote = ({ id, data }) => {
  return APIinstance.post(
    `${deliveryProcess.createDispatchNote.endpoint}${id}`,
    data,
  );
};

export const getDispatchNotes = ({
  invoiceId,
  enterpriseId,
  page,
  limit,
  movement,
  searchString,
}) => {
  const baseUrl = deliveryProcess.getDispatchNotes.endpoint;

  // If invoiceId exists → fetch by invoice
  if (invoiceId) {
    return APIinstance.get(`${baseUrl}?invoiceId=${invoiceId}`);
  }

  const params = {
    enterpriseId,
    page,
    limit,
    ...(movement ? { movement } : {}),
    ...(searchString !== undefined && { searchString }),
  };
  return APIinstance.get(baseUrl, { params });
};

export const getDispatchNote = (id) => {
  return APIinstance.get(`${deliveryProcess.getDispatchNote.endpoint}${id}`);
};

export const previewDispatchNote = ({ id, data }) => {
  return APIinstance.post(
    `${deliveryProcess.previewDispatchNote.endpoint}${id}`,
    data,
  );
};

export const addTransporterToDispatchNote = ({ dispatchNoteId, data }) => {
  return APIinstance.put(
    `${deliveryProcess.addTransporter.endpoint}${dispatchNoteId}`,
    data,
  );
};

export const sendToTransporter = ({ dispatchNoteId, data }) => {
  return APIinstance.post(
    `${deliveryProcess.sendToTransporter.endpoint}${dispatchNoteId}`,
    data,
  );
};

export const addBookingToDispatchNote = ({ dispatchNoteId, data }) => {
  return APIinstance.post(
    `${deliveryProcess.addBooking.endpoint}${dispatchNoteId}`,
    data,
  );
};

export const updateDispatchNoteStatus = ({ dispatchNoteId, data }) => {
  return APIinstance.put(
    `${deliveryProcess.updateStatus.endpoint}${dispatchNoteId}`,
    data,
  );
};

export const update = ({ dispatchNoteId, data }) => {
  return APIinstance.put(
    `${deliveryProcess.update.endpoint}${dispatchNoteId}`,
    data,
  );
};

export const generateEWB = ({ dispatchNoteId, data }) => {
  return APIinstance.post(
    `${deliveryProcess.generateEWB.endpoint}${dispatchNoteId}`,
    data,
  );
};

export const updateEWBPartB = ({ data }) => {
  return APIinstance.put(deliveryProcess.updateEWBPartB.endpoint, data);
};

export const getEWB = ({ id }) => {
  return APIinstance.get(`${deliveryProcess.getEWB.endpoint}${id}`);
};

export const getEWBs = ({ id, page, limit }) => {
  return APIinstance.get(
    `${deliveryProcess.getEWBs.endpoint}?dispatchNoteId=${id}&page=${page}&limit=${limit}`,
  );
};

export const previewDeliveryChallan = ({ id, data }) => {
  return APIinstance.post(
    `${deliveryProcess.previewDeliveryChallan.endpoint}${id}`,
    data,
  );
};

export const generateDeliveryChallan = ({ id, data }) => {
  return APIinstance.post(
    `${deliveryProcess.generateDeliveryChallan.endpoint}${id}`,
    data,
  );
};

export const getDeliveryChallan = (id) => {
  return APIinstance.get(`${deliveryProcess.getDeliveryChallan.endpoint}${id}`);
};

export const getDeliveryChallans = ({ page, limit, searchString }) => {
  const { endpoint } = deliveryProcess.getDeliveryChallans;
  const params = {
    page,
    limit,
    ...(searchString !== undefined && { searchString }),
  };

  return APIinstance.get(endpoint, { params });
};

export const getPODs = ({ page, limit, status, searchString }) => {
  const { endpoint } = deliveryProcess.getPODs;
  const params = {
    page,
    limit,
    ...(status && { status }),

    ...(searchString !== undefined && { searchString }),
  };
  return APIinstance.get(endpoint, { params });
};

export const getPODByChallan = ({ id }) => {
  return APIinstance.get(`${deliveryProcess.getPODByChallan.endpoint}${id}`);
};

export const getPODByID = ({ id }) => {
  return APIinstance.get(`${deliveryProcess.getPODbyId.endpoint}${id}`);
};

export const sendPOD = ({ data }) => {
  return APIinstance.post(deliveryProcess.sendPOD.endpoint, data);
};

export const acceptPOD = ({ podId, data }) => {
  const endpoint = deliveryProcess.acceptPOD.endpoint.replace(':podId', podId);
  return APIinstance.post(endpoint, data);
};

export const rejectPOD = ({ podId, data }) => {
  const endpoint = deliveryProcess.rejectPOD.endpoint.replace(':podId', podId);
  return APIinstance.post(endpoint, data);
};

export const modifyAndAcceptPOD = ({ podId, data }) => {
  const endpoint = deliveryProcess.modifyAndAcceptPOD.endpoint.replace(
    ':podId',
    podId,
  );
  return APIinstance.put(endpoint, data);
};

export const previewPOD = ({ id }) => {
  return APIinstance.post(`${deliveryProcess.previewPOD.endpoint}${id}`);
};

export const getGRNs = ({
  page,
  limit,
  invoiceId,
  parentQcStatus,
  grnStatus,
  searchString,
}) => {
  const { endpoint } = deliveryProcess.getGRNs;
  const params = {
    page,
    limit,
    ...(parentQcStatus && { parentQcStatus }),
    ...(grnStatus && { grnStatus }),
    ...(invoiceId && { invoiceId }),
    ...(searchString !== undefined && { searchString }),
  };

  return APIinstance.get(endpoint, { params });
};

export const getGRN = ({ id }) => {
  return APIinstance.get(`${deliveryProcess.getGRN.endpoint}${id}`);
};

export const previewGRN = ({ id }) => {
  return APIinstance.post(`${deliveryProcess.previewGRN.endpoint}${id}`);
};

// export const getItemsToCreateDebitNote = ({ id }) => {
//   return APIinstance.get(
//     `${deliveryProcess.getItemsToCreateDebitNote.endpoint}${id}`,
//   );
// };

export const updateStatusForQC = ({ id, data }) => {
  return APIinstance.put(
    `${deliveryProcess.updateStatusForQC.endpoint}${id}`,
    data,
  );
};
