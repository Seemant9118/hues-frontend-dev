export const buildBuyerSellerRows = (debitNoteItems = []) => {
  return debitNoteItems.flatMap((item) => {
    const product = item.invoiceItem?.orderItemId?.productDetails || {};

    const buyerQty =
      (item.refundQuantity ?? 0) + (item.replacementQuantity ?? 0);

    const sellerResponses = item.metaData?.creditNoteDraftResponse || [];

    // fallback if no seller response yet
    const rows = sellerResponses.length
      ? sellerResponses
      : [
          {
            id: null,
            responseType: '-',
            approvedQuantity: '-',
            approvedAmount: '-',
          },
        ];

    return rows.map((resp, index) => ({
      rowId: `${item.id}-${index}`,
      id: resp.id,
      debitNoteItemId: item.id,

      // control flags
      _isFirstRow: index === 0,
      _rowSpanCount: rows.length,

      // -------- BUYER (render only once) --------
      skuId: product.skuId || '-',
      productName: product.productName || '-',
      isUnsatisfactory: item.isUnsatisfactory,
      isShortDelivery: item.isShortDelivery,
      isCreditNoteCreated: item.isCreditNoteCreated,
      price: item.unitPrice,
      buyerQty,
      expectation: item.buyerExpectation || '-',
      internalRemark: item.metaData?.internalRemark || '-',

      // -------- SELLER --------
      sellerResponse: resp.responseType,

      sellerQty:
        resp.approvedQuantity ||
        resp.replacementQty ||
        resp.rejectedQuantity ||
        '-',
      sellerAmount:
        resp.responseType === 'ACCEPTED' ? resp.approvedAmount : '-',
    }));
  });
};
