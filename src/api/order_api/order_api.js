export const order_api = {
  // 1. Create Order
  createOrder: {
    endpoint: `/order/create`,
    endpointKey: "order_create",
  },
  //   2. Get Sales
  getSales: {
    endpoint: `/order/getsales/`,
    endpointKey: "get_sales",
  },
  //   3. Get Purchases
  getPurchases: {
    endpoint: `/order/getpurchases/`,
    endpointKey: "get_purchases",
  },
  //   4. Get Order Details
  getOrderDetails: {
    endpoint: `/order/getorders/details/`,
    endpointKey: "get_order_details",
  },
  //   5 . Delete Order
  deleteOrder: {
    endpoint: `/order/delete/`,
    endpointKey: "delete_order",
  },

  //   6. create Negotiation
  createNegotiation: {
    endpoint: `/order/negotiation/create`,
    endpointKey: "create_negotitation",
  },

  //   7 . get Negotiation details
  getNegotiationDetails: {
    endpoint: `/order/negotiation/negotiationdetails`,
    endpointKey: "get_negotiation_details",
  },
};
