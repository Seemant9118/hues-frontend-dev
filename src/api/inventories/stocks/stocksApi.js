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
  getStockDetails: {
    endpoint: `/inventory/:enterpriseId/inventory/:inventoryItemId/ledger`,
    endpointKey: 'getStockDetails',
  },
  adHocStockIn: {
    endpoint: `/inventory/adhoc/stock-in/`,
    endpointKey: 'adHoc_stock_in',
  },
  adHocStockOut: {
    endpoint: `/inventory/adhoc/stock-out/`,
    endpointKey: 'adHoc_stock_out',
  },
};
