import AddOns from './Layouts/AddOns';
import ContractsAndConsents from './Layouts/ContractsAndConsents';
import Description from './Layouts/Description';
import Operations from './Layouts/Operation';
import Overview from './Layouts/Overview';
import Pricing from './Layouts/Pricing';
import SLAAndWarranty from './Layouts/SLAAndWarranty';
import TermsAndControls from './Layouts/TermsAndControls';

// Services
export const stepsServiceConfig = [
  {
    key: 'overview',
    label: 'Overview',
    component: Overview,
    validate: (form) => {
      const newErrors = {};

      if (!form?.serviceCategoryId)
        newErrors.serviceCategoryId = 'Service category is required';
      if (!form?.serviceSubTypeId)
        newErrors.serviceSubTypeId = 'Service type is required';
      if (!form?.serviceName)
        newErrors.serviceName = 'Service name is required';
      if (!form?.serviceCode)
        newErrors.serviceCode = 'Service code is required';
      return newErrors;
    },
  },
  {
    key: 'pricing',
    label: 'Pricing & Tax',
    component: Pricing,
  },
  {
    key: 'operations',
    label: 'Operations',
    component: Operations,
  },
  {
    key: 'SLAAndWarranty',
    label: 'SLA & Warranty',
    component: SLAAndWarranty,
  },
  {
    key: 'description',
    label: 'Description',
    component: Description,
  },
  {
    key: 'addOns',
    label: 'Add-ons Services',
    component: AddOns,
  },
  {
    key: 'termsAndControls',
    label: 'Terms & Controls',
    component: TermsAndControls,
  },
  {
    key: 'contracts',
    label: 'Contracts and Consents',
    component: ContractsAndConsents,
  },
];
