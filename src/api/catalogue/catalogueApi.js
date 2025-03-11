export const catalogueApis = {
  searchedCatalogues: {
    endpoint: `/catalogue/search`,
    endpointKey: 'searched_catalogue',
  },
  createAndUpdateCatalogue: {
    endpoint: `/catalogue/additems/`,
    endpointKey: 'create_update_catalogue',
  },
  getCatalogues: {
    endpoint: `/catalogue/getcatalogue/`,
    endpointKey: 'get_catalogues',
  },
  deleteCatalogue: {
    endpoint: `/catalogue/deleteitem/`,
    endpointKey: 'delete_catalogue',
  },
  getProductCatalogue: {
    endpoint: `/catalogue/getgoods/`,
    endpointKey: 'get_product_catalogue',
  },
  getServiceCatalogue: {
    endpoint: `/catalogue/getservices/`,
    endpointKey: 'get_service_catalogue',
  },
  getVendorProductCatalogue: {
    endpoint: `/catalogue/vendor/getgoods/`,
    endpointKey: 'get_vendor_product_catalogue',
  },
  getVendorServiceCatalogue: {
    endpoint: `/catalogue/vendor/getservices/`,
    endpointKey: 'get_vendor_service_catalogue',
  },
  bulkDeleteCatalogueItems: {
    endpoint: `/catalogue/removebulkitems`,
    endpointKey: 'delete_bulk_catalogue_items',
  },
};
