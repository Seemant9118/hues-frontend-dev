import { toast } from 'sonner';
import FinalPreview from './layouts/FinalPreview';
import GoodsDetail from './layouts/GoodsDetail';

export const GoodsOrderStepsConfig = [
  {
    key: 'goods-details',
    label: 'Goods Details',
    component: GoodsDetail,
    validate: (data) => {
      const errs = {};
      if (data.cta === 'offer') {
        if (data.clientType === 'B2B' && data.buyerId == null)
          errs.buyerId = 'Please select a Client/Customer';
        if (data.clientType === 'B2C' && data.buyerId == null)
          errs.buyerId = 'Please select a Customer';
      } else if (data.sellerEnterpriseId == null)
        errs.sellerEnterpriseId = 'Please select a Vendor';
      if (!data.orderItems || data.orderItems.length === 0) {
        errs.orderItem = 'Please select at least 1 item';
        toast.error('Please add an item to proceed.');
      }
      return errs;
    },
  },
  {
    key: 'preview-final',
    label: 'Preview',
    component: FinalPreview,
  },
];
