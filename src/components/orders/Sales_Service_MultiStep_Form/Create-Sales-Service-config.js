import BuyerContext from './layouts/BuyerContext';
import PreviewFinalPage from './layouts/PreviewFinalPage';
import ServicesLineItems from './layouts/ServiceLineItems';
import {
  validateBuyerContext,
  validateOfferTerms,
  validateServices,
} from './validator';

export const getSalesServiceFormSteps = ({ cta }) => {
  return [
    {
      key: 'buyer-context',
      label: cta === 'offer' ? 'Client Context' : 'Vendor Context',
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
      key: 'offer-terms-preview',
      label: 'Offer Terms & Preview',
      component: PreviewFinalPage,
      validate: validateOfferTerms,
    },
  ];
};
