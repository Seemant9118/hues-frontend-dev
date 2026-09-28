'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import InvoicePreview from '@/components/ui/InvoicePreview';
import { usePurchaseInvoiceActions } from '../hooks/usePurchaseInvoiceActions';

const PurchaseFinalPreview = ({ formData, setFormData }) => {
  const enterpriseId = getEnterpriseId();
  const translations = useTranslations('components.create_edit_order');
  const [url, setUrl] = useState(null);

  const {
    isPINError,
    setIsPINError,
    invoiceMutation,
    handleSubmit,
    handlePreview,
  } = usePurchaseInvoiceActions({
    order: formData,
    fields: formData._formFields,
    isGstApplicableForSelectedVendor: formData.isGstApplicableForSelectedVendor,
    isOrder: formData.isOrder,
    translations,
    setUrl,
    setIsInvoicePreview: () => {}, // Not needed in multi-step
    activeWorkflowData: formData.activeWorkflowData, // Injected from parent
  });

  React.useEffect(() => {
    // Auto-fetch the initial preview when entering the step
    handlePreview(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full w-full">
      <InvoicePreview
        enterpriseId={enterpriseId}
        order={formData}
        setOrder={setFormData}
        getAddressRelatedData={
          formData?.getAddressRelatedData || {
            clientId: enterpriseId,
            clientEnterpriseId: enterpriseId,
          }
        }
        setIsPreviewOpen={() => {}}
        url={url}
        isPDFProp={true}
        isPendingInvoice={invoiceMutation.isPending}
        handleCreateFn={handleSubmit}
        handlePreview={handlePreview}
        isCreatable={true}
        isAddressAddable={true}
        isCustomerRemarksAddable={true}
        isBankAccountDetailsSelectable={true}
        isActionable={true}
        isPINError={isPINError}
        setIsPINError={setIsPINError}
        hideSubmitActions={true}
      />
    </div>
  );
};

export default PurchaseFinalPreview;
