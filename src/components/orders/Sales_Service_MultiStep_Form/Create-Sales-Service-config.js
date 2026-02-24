import BuyerContext from './layouts/BuyerContext';
import OfferTermsControls from './layouts/OfferTermsControls';
import ServicesLineItems from './layouts/ServiceLineItems';

/* --- VALIDATIONS ------*/

/* --------- DYNAMIC STEPS EXPORT ----------*/
export const getSalesServiceFormSteps = () => {
  const step1 = {
    key: 'buyer-context',
    label: 'Buyer Context',
    description: 'Buyer and context details',
    title: 'Buyer Context Details',
    subtitle: 'Enter buyer and context information for the sales service',
    component: BuyerContext,
    // validate: validateMovementType,
  };
  const step2 = {
    key: 'services-line-items',
    label: 'Services & Line Items',
    description: 'Select services and line items',
    title: 'Services & Line Items',
    subtitle: 'Select services and line items for the sales service',
    component: ServicesLineItems,
    // validate: validateInvoice,
  };

  const step3 = {
    key: 'offer-terms-controls',
    label: 'Offer Terms & Controls',
    description: 'Offer terms and controls',
    title: 'Offer Terms & Controls',
    subtitle: 'Set offer terms and controls for the sales service',
    component: OfferTermsControls,
    // validate: validateAddress,
  };

  return [step1, step2, step3];
};
