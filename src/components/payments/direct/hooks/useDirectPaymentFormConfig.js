import { useEffect, useState } from 'react';
import { getFormConfig } from '@/services/Form_Config_Services/FormConfigServices';

export const DEFAULT_PAYMENT_FIELDS = [
  {
    key: 'invoiceId',
    label: 'Invoice',
    type: 'SELECT',
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
    key: 'paymentMode',
    label: 'Payment Mode',
    type: 'SELECT',
    inputMode: 'USER',
    required: true,
    visible: true,
    order: 20,
    kind: 'SYSTEM',
    options: [
      { value: 'neft', label: 'NEFT' },
      { value: 'rtgs', label: 'RTGS' },
      { value: 'upi', label: 'UPI' },
      { value: 'creditDebitCard', label: 'Credit/Debit Card' },
      { value: 'cheque', label: 'Cheque' },
      { value: 'cash', label: 'Cash' },
    ],
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'paymentDate',
    label: 'Payment Date',
    type: 'DATE',
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
    key: 'bankAccountId',
    label: 'Bank Account Details',
    type: 'SELECT',
    inputMode: 'USER',
    required: false,
    visible: true,
    order: 40,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'transactionId',
    label: 'Transaction ID',
    type: 'TEXT',
    inputMode: 'USER',
    required: true,
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
    key: 'amount',
    label: 'Amount Paid',
    type: 'NUMBER',
    inputMode: 'USER',
    required: true,
    visible: true,
    order: 60,
    kind: 'SYSTEM',
    capabilities: {
      canRenameLabel: true,
      canHide: true,
      canReorder: true,
      canChangeRequired: true,
    },
  },
  {
    key: 'balance',
    label: 'Balance',
    type: 'NUMBER',
    inputMode: 'USER',
    required: false,
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
];

export function useDirectPaymentFormConfig({ enterpriseId, setPaymentData }) {
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
      setPaymentData((prevData) => ({
        ...prevData,
        _formFields: updatedFields,
      }));
      return updatedFields;
    });
  };

  useEffect(() => {
    const fetchConfig = async () => {
      const moduleName = 'PAYMENT';
      const config = await getFormConfig(moduleName);

      let fetchedFields = config.fields || [];
      if (fetchedFields.length === 0) {
        fetchedFields = DEFAULT_PAYMENT_FIELDS;
      } else {
        const fetchedKeys = fetchedFields.map((f) => f.key);
        const missingDefaults = DEFAULT_PAYMENT_FIELDS.filter(
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
      setPaymentData((prev) => ({ ...prev, _formFields: fetchedFields }));
    };
    fetchConfig();
  }, [enterpriseId, setPaymentData]);

  const handleSaveSuccess = (updatedConfig, isFallback) => {
    setFields(updatedConfig.fields || []);
    setPaymentData((prev) => ({
      ...prev,
      _formFields: updatedConfig.fields,
    }));

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
