import AddOns from './steps/AddOns';
import ContractsAndConsents from './steps/ContractsAndConsents';
import Description from './steps/Description';
import Operations from './steps/Operation';
import Overview from './steps/Overview';
import Pricing from './steps/Pricing';
import SLAAndWarranty from './steps/SLAAndWarranty';

// Services
export const stepsServiceConfig = [
  {
    key: 'overview',
    title: 'Overview',
    component: Overview,
    validate: (form) => {
      const newErrors = {};

      if (!form?.serviceCategory)
        newErrors.serviceCategory = 'Service category is required';
      if (!form?.serviceName)
        newErrors.serviceName = 'Service name is required';
      if (!form?.deliveryMode)
        newErrors.deliveryMode = 'Delivery module is required';
      if (!form?.unitOfMeasure)
        newErrors.unitOfMeasure = 'Unit of measure is required';

      // Hours validation
      if (form?.hours !== '' && form?.hours !== null) {
        const h = Number(form?.hours);
        if (h < 0 || h > 24) {
          newErrors.hours = 'Hours must be between 0 and 24.';
        }
      }

      // Minutes validation
      if (form?.minutes !== '' && form?.minutes !== null) {
        const m = Number(form?.minutes);
        if (m < 0 || m > 59) {
          newErrors.minutes = 'Minutes must be between 0 and 59.';
        }
      }

      return newErrors;
    },
  },
  {
    key: 'pricing',
    title: 'Pricing & Tax',
    component: Pricing,
    validate: (form) => {
      const errors = {};

      if (!form?.basePrice || Number(form?.basePrice) <= 0) {
        errors.basePrice = 'Base price must be greater than 0.';
      }

      if (!form?.pricingModel) {
        errors.pricingModel = 'Pricing model is required.';
      }

      if (!form?.taxClass) {
        errors.taxClass = 'Tax class / GST rate is required.';
      }

      if (!form?.sacCode) {
        errors.sacCode = 'HSN / SAC code is required.';
      } else if (!/^\d+$/.test(form.sacCode)) {
        errors.sacCode = 'HSN / SAC Code must be numeric.';
      }

      return errors;
    },
  },
  {
    key: 'operations',
    title: 'Operations',
    component: Operations,
  },
  {
    key: 'SLAAndWarranty',
    title: 'SLA & Warranty',
    component: SLAAndWarranty,
    validate: (form) => {
      const newErrors = {};
      const sla = form?.slaConfig || {};

      // ---- REQUIRED FIELD: Standard SLA ----
      if (!sla?.standardSLA?.trim()) {
        newErrors.standardSLA = 'Standard SLA is required.';
      }

      // ---- REVISION POLICY: numberOfRevisions ----
      const numberOfRevisions = sla?.revisionPolicy?.numberOfRevisions;
      if (
        numberOfRevisions !== '' &&
        numberOfRevisions !== undefined &&
        Number(numberOfRevisions) < 0
      ) {
        newErrors.numberOfRevisions = 'Revision count cannot be negative.';
      }

      // ---- REVISION POLICY: revisionWindowDays ----
      const revisionWindowDays = sla?.revisionPolicy?.revisionWindowDays;
      if (
        revisionWindowDays !== '' &&
        revisionWindowDays !== undefined &&
        Number(revisionWindowDays) < 0
      ) {
        newErrors.revisionWindowDays = 'Revision window cannot be negative.';
      }

      return newErrors;
    },
  },
  {
    key: 'description',
    title: 'Description',
    component: Description,
    validate: (form) => {
      const newErrors = {};

      // Short Description Required
      if (!form?.shortDescription?.trim()) {
        newErrors.shortDescription = 'Short description is required.';
      }

      // Optional: Long description min length
      if (form?.longDescription && form.longDescription.trim().length < 10) {
        newErrors.longDescription =
          'Long description should be at least 10 characters.';
      }

      return newErrors;
    },
  },
  {
    key: 'addOns',
    title: 'Add-ons Services',
    component: AddOns,
  },
  {
    key: 'contracts',
    title: 'Contracts & Consents',
    component: ContractsAndConsents,
    validate: (form) => {
      const newErrors = {};

      if (!form?.contractsConfig?.defaultServiceAgreementTemplate) {
        newErrors.contractsConfig = {
          ...(newErrors.contractsConfig || {}),
          defaultServiceAgreementTemplate:
            'Please select a service agreement template.',
        };
      }

      if (
        !form?.contractsConfig?.requiredConsents ||
        !form.contractsConfig.requiredConsents.length
      ) {
        newErrors.contractsConfig = {
          ...(newErrors.contractsConfig || {}),
          requiredConsents: 'At least one consent is required.',
        };
      }

      if (!form?.contractsConfig?.complianceNotes?.trim()) {
        newErrors.contractsConfig = {
          ...(newErrors.contractsConfig || {}),
          complianceNotes: 'Compliance notes cannot be empty.',
        };
      }

      return newErrors;
    },
  },
];
