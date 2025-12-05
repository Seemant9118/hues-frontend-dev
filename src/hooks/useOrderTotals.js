import { useMemo } from 'react';

export default function useOrderTotals(orderItems = [], gstApplicable = false) {
  return useMemo(() => {
    let grossAmount = 0; // Base value (qty * price)
    let totalDiscountAmount = 0; // Sum of discount amounts
    let totalGstAmount = 0; // Sum of GST values
    let finalAmount = 0; // Total after discount + GST

    orderItems.forEach((item) => {
      const base = Number(item.totalAmount || 0); // before discount
      const disc = Number(item.discountAmount || 0); // discount value
      const gst = Number(item.totalGstAmount || 0); // gst value
      const total = Number(item.finalAmount || 0); // after discount + gst

      grossAmount += base;
      totalDiscountAmount += disc;

      if (gstApplicable) {
        totalGstAmount += gst;
      }

      finalAmount += total;
    });

    return {
      grossAmount, // Base value (qty * price)
      totalDiscountAmount, // SUM of item.discountAmount
      totalGstAmount, // SUM of item.totalGstAmount
      finalAmount, // (base - discount + GST) for all items
    };
  }, [orderItems, gstApplicable]);
}
