import AdditionalInfo from './AdditionalInfo';
import ItemOverview from './ItemOverview';
import PromotionalContents from './PromotionalContents';
import TradePromotions from './TradePromotions';

// Services
export const stepsGoodsConfig = [
  {
    key: 'overview',
    title: 'Item Overview',
    component: ItemOverview,
    validate: (form) => {
      const newErrors = {};

      if (!form?.productName)
        newErrors.productName = 'Product name is required';
      if (!form?.categoryId) newErrors.categoryId = 'Category is required';
      if (!form?.subCategoryId)
        newErrors.subCategoryId = 'Sub Category is required';
      if (!form?.manufacturerName)
        newErrors.manufacturerName = `Manufacturer's name is required`;
      if (!form?.hsnCode) newErrors.hsnCode = `HSN Code is required`;
      if (!form?.gstPercentage) newErrors.gstPercentage = `GST(%) is required`;
      if (!form?.description) newErrors.description = `Description is required`;

      return newErrors;
    },
  },
  {
    key: 'additionalInfo',
    title: 'Additional Information',
    component: AdditionalInfo,
    validate: (form) => {
      const newErrors = {};

      // Pricing validations
      if (!form?.salesPrice || Number(form.salesPrice) <= 0) {
        newErrors.salesPrice = 'Sales price is required';
      }

      if (!form?.costPrice || Number(form.costPrice) <= 0) {
        newErrors.costPrice = 'Cost price is required';
      }

      if (!form?.mrp || Number(form.mrp) <= 0) {
        newErrors.mrp = 'MRP is required';
      }

      return newErrors;
    },
  },
  {
    key: 'tradePromotions',
    title: 'Trade Promotions',
    component: TradePromotions,
  },
  {
    key: 'promotionalContents',
    title: 'Promotional Content',
    component: PromotionalContents,
  },
];
