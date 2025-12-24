export const stockApis = {
  getMaterialMovementStocks: {
    endpoint: `/inventory/qc/stock-in/list`,
    endpointKey: 'get_material_movement_stocks_list',
  },
  getMaterialMovmentStock: {
    endpoint: `/inventory/qc/stock-in/`,
    endpointKey: 'get_material_movement_stock',
  },

  getStocksItems: {
    endpoint: `/inventory/:enterpriseId/inventory-items`,
    endpointKey: 'get_stocks_items',
  },
};
