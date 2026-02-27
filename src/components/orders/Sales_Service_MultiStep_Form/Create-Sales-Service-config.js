import BuyerContext from './layouts/BuyerContext';
import OfferTermsControls from './layouts/OfferTermsControls';
import ServicesLineItems from './layouts/ServiceLineItems';
import {
  validateBuyerContext,
  validateOfferTerms,
  validateServices,
} from './validator';

export const getSalesServiceFormSteps = () => {
  return [
    {
      key: 'buyer-context',
      label: 'Buyer Context',
      component: BuyerContext,
      validate: validateBuyerContext,
    },
    {
      key: 'services-line-items',
      label: 'Services & Line Items',
      component: ServicesLineItems,
      validate: validateServices,
    },
    {
      key: 'offer-terms-controls',
      label: 'Offer Terms & Controls',
      component: OfferTermsControls,
      validate: validateOfferTerms,
    },
  ];
};
