export const buildBuyerSellerRowsForCredits = (creditNoteItems = []) => {
  return creditNoteItems.flatMap((creditItem) => {
    const debitItem = creditItem.debitNoteItem || {};
    const product = debitItem.invoiceItem?.orderItemId?.productDetails || {};

    // Buyer quantity = refund + replacement
    const buyerQty =
      (debitItem.refundQuantity ?? 0) + (debitItem.replacementQuantity ?? 0);

    // Seller responses come from credit note
    const sellerResponses = creditItem.responseDetails || [];

    // fallback row if no response exists
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
      rowId: `${creditItem.id}-${index}`,
      id: resp.id,
      debitNoteItemId: debitItem.id,
      creditNoteItemId: creditItem.id,

      // ---- table control flags ----
      _isFirstRow: index === 0,
      _rowSpanCount: rows.length,

      // -------- BUYER (render once) --------
      skuId: product.skuId || '-',
      productName: product.productName || '-',
      isUnsatisfactory: debitItem.isUnsatisfactory,
      isShortDelivery: debitItem.isShortDelivery,
      price: creditItem.unitPrice,

      claimedQty: creditItem.claimedQuantity,
      buyerQty,
      expectation: debitItem.buyerExpectation || '-',
      internalRemark: debitItem.metaData?.internalRemark || '-',

      // -------- SELLER --------
      sellerResponse: resp.responseType || '-',

      sellerQty:
        resp.approvedQuantity ||
        resp.replacementQuantity ||
        resp.rejectedQuantity ||
        '-',

      sellerAmount:
        resp.responseType === 'ACCEPTED' ? resp.approvedAmount : '-',
    }));
  });
};
