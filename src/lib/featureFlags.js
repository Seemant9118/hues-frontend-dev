export const FEATURE_FLAGS = {
  ACCOUNTING: {
    enabled: true, // Disable entire module if needed
    label: 'Accounting Module',
    routePrefixes: ['/dashboard/accounting'],
    subModules: {
      TRIAL_BALANCE: {
        enabled: true,
        label: 'Trial Balance Page',
        routePrefixes: ['/dashboard/accounting/trial-balance'],
        features: {
          WORKBENCH: {
            enabled: true,
            label: 'Workbench T-Account View',
          },
        },
      },
    },
  },
  TRANSPORT: {
    enabled: true,
    label: 'Transport Module',
    routePrefixes: ['/dashboard/transport'],
    subModules: {
      DELIVERY_CHALLAN: {
        enabled: true,
        label: 'Delivery Challan',
        description:
          'Transport module — view, create, and review journal entries against the trial balance.',
        routePrefixes: ['/dashboard/transport/delivery-challan'],
        features: {
          EWB: {
            enabled: false,
            label: 'EWB',
            description:
              'Transport module — view, create, and review journal entries against the trial balance.',
          },
        },
      },
    },
  },
};
