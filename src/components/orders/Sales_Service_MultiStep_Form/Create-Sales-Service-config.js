import BuyerContext from './layouts/BuyerContext';
import ServicesLineItems from './layouts/ServiceLineItems';
import { validateBuyerContext, validateServices } from './validator';

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
    // {
    //   key: 'offer-terms-controls',
    //   label: 'Offer Terms & Controls',
    //   component: OfferTermsControls,
    //   validate: validateOfferTerms,
    // },
  ];
};
