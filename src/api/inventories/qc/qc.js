export const qcApis = {
  getQCs: {
    endpoint: `/inventory/qc/list`,
    endpointKey: 'get_qc_list',
  },
  getQCDetails: {
    endpoint: `/inventory/qc/details/`,
    endpointKey: 'get_qc_list',
  },
  updateQC: {
    endpoint: `/inventory/qc/update/`,
    endpointKey: 'update_QC',
  },
  getQCDetailsWithGRNs: {
    endpoint: `/inventory/qc/grn/`,
    endpointKey: 'get_qc_details_with_grns',
  },
  updateBulkQc: {
    enpoint: `/inventory/qc/bulk-update`,
    endpointKey: 'update_bulk_qc',
  },
  stockInQc: {
    endpoint: `/inventory/qc/stock-in/`,
    endpointKey: 'stock_in_qc',
  },
};
