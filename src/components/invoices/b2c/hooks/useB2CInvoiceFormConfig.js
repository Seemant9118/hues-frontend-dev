import { useEffect, useState } from 'react';
import { getFormConfig } from '@/services/Form_Config_Services/FormConfigServices';

export const DEFAULT_B2C_FIELDS = [
  {
    key: 'invoiceDate',
    label: 'Invoice Date',
    type: 'DATE',
    inputMode: 'USER',
    required: true,
    visible: true,
    order: 10,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'buyerId',
    label: 'Customer Mobile',
    type: 'SELECT',
    inputMode: 'USER',
    required: true,
    visible: true,
    order: 20,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'buyerName',
    label: 'Customer Name',
    type: 'TEXT',
    inputMode: 'USER',
    required: true,
    visible: true,
    order: 30,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'addressType',
    label: 'Address Type',
    type: 'SELECT',
    inputMode: 'USER',
    required: true,
    visible: true,
    order: 40,
    kind: 'SYSTEM',
    options: [
      { value: 'OTC', label: 'OTC (Over-the-Counter)' },
      { value: 'deliveryPurchase', label: 'Delivery Purchase' },
    ],
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'buyerAddress',
    label: 'Customer Address',
    type: 'TEXT',
    inputMode: 'USER',
    required: false,
    visible: true,
    order: 50,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'invoiceType',
    label: 'Item Type',
    type: 'SELECT',
    inputMode: 'USER',
    required: true,
    visible: true,
    order: 60,
    kind: 'SYSTEM',
    options: [
      { value: 'GOODS', label: 'Goods' },
      { value: 'SERVICE', label: 'Services' },
    ],
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'productId',
    label: 'Item',
    type: 'SELECT',
    inputMode: 'USER',
    required: true,
    visible: true,
    order: 70,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'batch',
    label: 'Batch',
    type: 'SELECT',
    inputMode: 'USER',
    required: false,
    visible: true,
    order: 80,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'quantity',
    label: 'Quantity',
    type: 'NUMBER',
    inputMode: 'USER',
    required: true,
    visible: true,
    order: 90,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'unitPrice',
    label: 'Price',
    type: 'NUMBER',
    inputMode: 'USER',
    required: true,
    visible: true,
    order: 100,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'gstPerUnit',
    label: 'GST %',
    type: 'NUMBER',
    inputMode: 'USER',
    required: false,
    visible: true,
    order: 110,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'totalAmount',
    label: 'Gross amount',
    type: 'NUMBER',
    inputMode: 'USER',
    required: false,
    visible: true,
    order: 120,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'totalGstAmount',
    label: 'Total GST Amount',
    type: 'NUMBER',
    inputMode: 'USER',
    required: false,
    visible: true,
    order: 130,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'expiryDate',
    label: 'Expiry Date',
    type: 'DATE',
    inputMode: 'USER',
    required: false,
    visible: true,
    order: 140,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
];

export function useB2CInvoiceFormConfig({ enterpriseId, setOrder }) {
  const [fields, setFields] = useState([]);
  const [baseVersion, setBaseVersion] = useState(1);
  const [revision, setRevision] = useState(0);
  const [etag, setEtag] = useState('');
  const [originalCustomFields, setOriginalCustomFields] = useState([]);
  const [originalSystemFields, setOriginalSystemFields] = useState([]);

  const handleSetFields = (newFields) => {
    setFields((prev) => {
      const updatedFields =
        typeof newFields === 'function' ? newFields(prev) : newFields;
      setOrder((prevOrder) => ({ ...prevOrder, _formFields: updatedFields }));
      return updatedFields;
    });
  };

  useEffect(() => {
    const fetchConfig = async () => {
      const moduleName = 'B2CINVOICE';
      const config = await getFormConfig(moduleName);

      let fetchedFields = config.fields || [];
      if (fetchedFields.length === 0) {
        fetchedFields = DEFAULT_B2C_FIELDS;
      } else {
        const fetchedKeys = fetchedFields.map((f) => f.key);
        const missingDefaults = DEFAULT_B2C_FIELDS.filter(
          (defaultField) => !fetchedKeys.includes(defaultField.key),
        );
        fetchedFields = [...fetchedFields, ...missingDefaults];
      }

      setFields(fetchedFields);
      setBaseVersion(config.baseVersion || 1);
      setRevision(config.revision || 0);
      setEtag(config.etag || '');
      setOriginalCustomFields(
        config.originalCustomFields ||
          fetchedFields.filter((f) => f.kind === 'CUSTOM'),
      );
      setOriginalSystemFields(
        config.originalSystemFields ||
          JSON.parse(
            JSON.stringify(fetchedFields.filter((f) => f.kind === 'SYSTEM')),
          ),
      );
      setOrder((prev) => ({ ...prev, _formFields: fetchedFields }));
    };
    fetchConfig();
  }, [enterpriseId, setOrder]);

  const handleSaveSuccess = (updatedConfig, isFallback) => {
    setFields(updatedConfig.fields || []);
    setOrder((prev) => ({ ...prev, _formFields: updatedConfig.fields }));

    if (!isFallback) {
      setBaseVersion(updatedConfig.baseVersion || 1);
      setRevision(updatedConfig.revision || 0);
      setEtag(updatedConfig.etag || '');
      setOriginalCustomFields(
        (updatedConfig.fields || []).filter((f) => f.kind === 'CUSTOM'),
      );
      setOriginalSystemFields(
        JSON.parse(
          JSON.stringify(
            (updatedConfig.fields || []).filter((f) => f.kind === 'SYSTEM'),
          ),
        ),
      );
    }
  };

  return {
    fields,
    baseVersion,
    revision,
    etag,
    originalCustomFields,
    originalSystemFields,
    handleSetFields,
    handleSaveSuccess,
  };
}
