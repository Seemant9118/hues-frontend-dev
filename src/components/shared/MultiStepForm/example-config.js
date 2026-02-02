import { Package, Truck } from 'lucide-react';

// Step components
import AddressSelectionLayout from './layouts/AddressSelectionLayout';
import SearchListLayout from './layouts/SearchListLayout';
import SelectionCardLayout from './layouts/SelectionCardLayout';
import TableSummaryLayout from './layouts/TableSummaryLayout';

const movementTypeOptions = [
  {
    value: 'Supply for sale (final delivery to customer)',
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
    value: 'Internal logistics (stock transfer / repositioning)',
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
      onSelect={(value) => setFormData({ ...formData, movementType: value })}
      columns={2}
      errors={errors}
    />
  );
}

function Step2FindInvoice({ formData, setFormData, errors }) {
  return (
    <SearchListLayout
      selectedValue={formData.invoiceId}
      onSelect={(invoiceId, orderId) =>
        setFormData({ ...formData, invoiceId, orderId })
      }
      // searchPlaceholder="Search by Invoice No, Customer, Phone, GST, or Amount..."
      // filterTabs={[
      //     { value: 'today', label: 'Today' },
      //     { value: 'week', label: 'Last 7 Days' },
      //     { value: 'pending', label: 'Pending Dispatch' },
      //     { value: 'paid', label: 'Paid' },
      //     { value: 'unpaid', label: 'Unpaid' },
      // ]}
      // activeFilter={formData.filter || 'today'}
      // onFilterChange={(filter) => setFormData({ ...formData, filter })}
      errors={errors}
    />
  );
}

function Step3Address({ formData, setFormData, errors }) {
  return (
    <AddressSelectionLayout
      formData={formData}
      setFormData={setFormData}
      errorMsg={errors}
      sectionLabel="Addresses"
    />
  );
}

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

// Step configuration
export const createDispatchSteps = [
  {
    key: 'movement-type',
    label: 'Movement Type',
    description: 'Choose dispatch type',
    title: 'Select Movement Type',
    subtitle: 'Choose the type of dispatch you want to create',
    component: Step1MovementType,
    validate: (formData) => {
      if (!formData.movementType) {
        return { movementType: 'Please select a movement type' };
      }
      return {};
    },
  },
  {
    key: 'invoice',
    label: 'Invoice',
    description: 'Find invoice',
    title: 'Find Invoice',
    subtitle: 'Search and select an invoice for dispatch',
    component: Step2FindInvoice,
    validate: (formData) => {
      if (!formData.invoiceId) {
        return { invoiceId: 'Please select an invoice' };
      }
      return {};
    },
  },
  {
    key: 'address',
    label: 'Address',
    description: 'Dispatch locations',
    title: 'Dispatch Address',
    subtitle: 'Select the address where items will be dispatched',
    component: Step3Address,
    validate: (formData) => {
      const errors = {};

      if (!formData.dispatchFromAddressId) {
        errors.dispatchFromAddressId = 'Please select Dispatch From address';
      }

      if (!formData.billingFromAddressId) {
        errors.billingFromAddressId = 'Please select Billing From address';
      }

      return errors;
    },
  },
  {
    key: 'review',
    label: 'Review',
    description: 'Confirm & create',
    title: 'Select Items to Dispatch',
    subtitle: 'Choose items and quantities from selected invoice',
    component: Step4SelectItems,
    validate: (formData) => {
      if (!formData.selectedItems || formData.selectedItems.length === 0) {
        return { selectedItems: 'Please select at least one item' };
      }
      return {};
    },
  },
];
