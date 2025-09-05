export const stockInOutAPIs = {
  stockIn: {
    endpoint: `/inventory/:enterpriseId/orders/:orderId/stock-in`,
    endpointKey: 'stock_in',
  },
  stockOut: {
    endpoint: `/inventory/:enterpriseId/orders/:orderId/stock-out`,
    endpointKey: 'stock_out',
  },
  getUnits: {
    endpoint: `/units`,
    endpointKey: 'get_units',
  },
};
