export const FEATURE_FLAGS = {
  ACCOUNTING: {
    enabled: process.env.NEXT_PUBLIC_NODE_ENV === 'dev', // only visible in dev
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
      CASHFLOW: {
        enabled: true,
        label: 'Cash Flow Page',
        routePrefixes: ['/dashboard/accounting/cash-flow'],
        features: {},
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
  BUILDER_TEMPLATES: {
    enabled: process.env.NEXT_PUBLIC_NODE_ENV === 'dev',
    label: 'Builder Templates Module',
    routePrefixes: ['/dashboard/templates/drafts'],
  },
  BUILDER_FORMS: {
    enabled: process.env.NEXT_PUBLIC_NODE_ENV === 'dev',
    label: 'Builder Forms Module',
    routePrefixes: ['/dashboard/templates/forms'],
  },
  BUILDER_CONTRACTS: {
    enabled: process.env.NEXT_PUBLIC_NODE_ENV === 'dev',
    label: 'Builder Contracts Module',
    routePrefixes: ['/dashboard/templates/contracts'],
  },
  BUILDER_STUDIO: {
    enabled: process.env.NEXT_PUBLIC_NODE_ENV === 'dev',
    label: 'Builder Studio Module',
    routePrefixes: ['/dashboard/studio'],
  },
  DEVELOPER_MODE_TOGGLE: {
    enabled: process.env.NEXT_PUBLIC_NODE_ENV === 'dev',
    label: 'Developer Mode Toggle',
  },
  WORKFLOW_ENGINE: {
    enabled: false,
    label: 'Workflow Engine',
    routePrefixes: ['/dashboard/work-flow-engine'],
  },
};
