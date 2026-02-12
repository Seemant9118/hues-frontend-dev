import AdditionalInfo from './AdditionalInfo';
import ItemOverview from './ItemOverview';

// Services
export const stepsGoodsConfig = [
  {
    key: 'overview',
    title: 'Item Overview',
    component: ItemOverview,
    validate: (form) => {
      const newErrors = {};

      if (!form?.goodsTypeId)
        newErrors.goodsTypeId = 'Product type is required';

      if (!form?.productName?.trim?.())
        newErrors.productName = 'Product name is required';
      if (!form?.skuId) newErrors.skuId = 'SKU ID is required';
      if (!form?.categoryId) newErrors.categoryId = 'Category is required';
      if (!form?.subCategoryId)
        newErrors.subCategoryId = 'Sub Category is required';
      if (!form?.hsnCode) newErrors.hsnCode = `HSN Code is required`;
      if (!form?.gstPercentage) newErrors.gstPercentage = `GST(%) is required`;
      if (!form?.description) newErrors.description = `Description is required`;

      // FIX: Category validation (id OR name)
      const hasCategory = !!form?.categoryId || !!form?.categoryName?.trim?.();

      if (!hasCategory) newErrors.categoryId = 'Category is required';

      // FIX: SubCategory validation (id OR name)
      const hasSubCategory =
        !!form?.subCategoryId || !!form?.subCategoryName?.trim?.();

      if (!hasSubCategory) newErrors.subCategoryId = 'Sub Category is required';

      if (!form?.hsnCode?.trim?.()) newErrors.hsnCode = 'HSN Code is required';

      if (
        form?.gstPercentage === null ||
        form?.gstPercentage === undefined ||
        String(form?.gstPercentage).trim() === ''
      )
        newErrors.gstPercentage = 'GST(%) is required';

      if (!form?.description?.trim?.())
        newErrors.description = 'Description is required';

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

      // if (!form?.costPrice || Number(form.costPrice) <= 0) {
      //   newErrors.costPrice = 'Cost price is required';
      // }

      if (!form?.mrp || Number(form.mrp) <= 0) {
        newErrors.mrp = 'MRP is required';
      }

      return newErrors;
    },
  },
  // {
  //   key: 'tradePromotions',
  //   title: 'Trade Promotions',
  //   component: TradePromotions,
  // },
  // {
  //   key: 'promotionalContents',
  //   title: 'Promotional Content',
  //   component: PromotionalContents,
  // },
];
