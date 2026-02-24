import { Package, Truck } from 'lucide-react';

// Step components
import AddressSelectionLayout from './layouts/AddressSelectionLayout';
import SearchListLayout from './layouts/SearchListLayout';
import SelectionCardLayout from './layouts/SelectionCardLayout';
import StockItemLayout from './layouts/StockItemLayout';
import TableSummaryLayout from './layouts/TableSummaryLayout';

const INWARD = 'INWARD';
const OUTWARD = 'OUTWARD';

const movementTypeOptions = [
  {
    value: OUTWARD,
    icon: (props) => <Package {...props} />,
    title: 'Supply for Sale',
    description: 'Final delivery to customer based on invoice',
    features: [
      'Select from invoices',
      'Customer delivery',
      'Track dispatch status',
    ],
  },
  {
    value: INWARD,
    icon: (props) => <Truck {...props} />,
    title: 'Internal Logistic',
    description: 'Stock transfer between warehouses',
    features: [
      'Warehouse to warehouse',
      'Stock repositioning',
      'Internal tracking',
    ],
  },
];

function Step1MovementType({ formData, setFormData, errors }) {
  return (
    <SelectionCardLayout
      options={movementTypeOptions}
      selectedValue={formData.movementType}
      onSelect={(value) =>
        setFormData((prev) => ({
          ...prev,
          movementType: value,

          // Reset dependent values when movement type changes
          invoiceId: '',
          orderId: '',
          selectedItems: [],
          stockItems: [],
        }))
      }
      columns={2}
      errors={errors}
    />
  );
}

/** Supply for sale flow - Step 2 */
function Step2FindInvoice({ formData, setFormData, errors }) {
  return (
    <SearchListLayout
      selectedValue={formData.invoiceId}
      onSelect={(invoiceId, orderId) =>
        setFormData({ ...formData, invoiceId, orderId })
      }
      errors={errors}
    />
  );
}

/** Internal logistics flow - Step 2 */
function Step2FindStockItems({ formData, setFormData, errors }) {
  return (
    <StockItemLayout
      onChangeItems={(updatedItems) =>
        setFormData((prev) => ({
          ...prev,
          items: updatedItems,
        }))
      }
      onChange={(key, value) => setFormData((p) => ({ ...p, [key]: value }))}
      formData={formData}
      errors={errors}
    />
  );
}

/** Common step */
function Step3Address({ formData, setFormData, errors }) {
  const isInternalLogistics = formData.movementType === INWARD;

  return (
    <AddressSelectionLayout
      formData={formData}
      setFormData={setFormData}
      errorMsg={errors}
      sectionLabel="Addresses"
      leftField={{
        label: 'Dispatch From',
        placeholder: 'Select dispatch from...',
        keyName: 'dispatchFromAddressId',
      }}
      rightField={
        isInternalLogistics
          ? {
              label: 'Dispatch To',
              placeholder: 'Select dispatch to...',
              keyName: 'dispatchToAddressId',
            }
          : {
              label: 'Billing From',
              placeholder: 'Select billing from...',
              keyName: 'billingFromAddressId',
            }
      }
    />
  );
}

/** Supply for sale flow - Step 4 */
function Step4SelectItems({ formData, setFormData, errors }) {
  const selectedItems = formData.selectedItems || [];

  return (
    <TableSummaryLayout
      selectedInvoice={formData.invoiceId}
      selectedItems={selectedItems}
      onSelectedItemsChange={(updatedSelectedItems) =>
        setFormData((prev) => ({
          ...prev,
          selectedItems: updatedSelectedItems,
        }))
      }
      errors={errors}
    />
  );
}

/* --- VALIDATIONS ------*/
const validateMovementType = (formData) => {
  if (!formData.movementType) {
    return { movementType: 'Please select a movement type' };
  }
  return {};
};

const validateInvoice = (formData) => {
  if (!formData.invoiceId) {
    return { invoiceId: 'Please select an invoice' };
  }
  return {};
};

const validateStockItems = (formData) => {
  if (!formData.items || formData.items.length === 0) {
    return { items: 'Please select at least one stock item' };
  }
  return {};
};

const validateAddress = (formData) => {
  const errors = {};

  const isInternalLogistics = formData.movementType === INWARD;

  if (!formData.dispatchFromAddressId) {
    errors.dispatchFromAddressId = 'Please select Dispatch From address';
  }

  if (isInternalLogistics) {
    if (!formData.dispatchToAddressId) {
      errors.dispatchToAddressId = 'Please select Dispatch To address';
    }
  } else if (!formData.billingFromAddressId) {
    errors.billingFromAddressId = 'Please select Billing From address';
  }

  return errors;
};

const validateInvoiceItems = (formData) => {
  if (!formData.selectedItems || formData.selectedItems.length === 0) {
    return { selectedItems: 'Please select at least one item' };
  }
  return {};
};

/* --------- DYNAMIC STEPS EXPORT ----------*/

export const getCreateDispatchSteps = (formData) => {
  const isInternalLogistics = formData.movementType === INWARD;

  // Step 1 always same
  const step1 = {
    key: 'movement-type',
    label: 'Movement Type',
    description: 'Choose dispatch type',
    title: 'Select Movement Type',
    subtitle: 'Choose the type of dispatch you want to create',
    component: Step1MovementType,
    validate: validateMovementType,
  };

  // Step 3 always same
  const step3 = {
    key: 'address',
    label: 'Address',
    description: 'Dispatch locations',
    title: 'Dispatch Address',
    subtitle: 'Select the address where items will be dispatched',
    component: Step3Address,
    validate: validateAddress,
  };

  //  Supply for sale flow
  if (!isInternalLogistics) {
    return [
      step1,
      {
        key: 'invoice',
        label: 'Invoice',
        description: 'Find invoice',
        title: 'Find Invoice',
        subtitle: 'Search and select an invoice for dispatch',
        component: Step2FindInvoice,
        validate: validateInvoice,
      },
      step3,
      {
        key: 'review',
        label: 'Review',
        description: 'Confirm & create',
        title: 'Select Items to Dispatch',
        subtitle: 'Choose items and quantities from selected invoice',
        component: Step4SelectItems,
        validate: validateInvoiceItems,
      },
    ];
  }

  //  Internal logistics flow
  return [
    step1,
    {
      key: 'stock-items',
      label: 'Stock Items',
      description: 'Select stock items',
      title: 'Find Stock Items',
      subtitle: 'Search and select stock items for internal transfer',
      component: Step2FindStockItems,
      validate: validateStockItems,
    },
    step3,
  ];
};
