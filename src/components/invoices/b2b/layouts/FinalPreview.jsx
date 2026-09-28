'use client';

import React, { useState } from 'react';
import InvoicePreview from '@/components/ui/InvoicePreview';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import { useTranslations } from 'next-intl';
import { useB2BInvoiceActions } from '../hooks/useB2BInvoiceActions';

const FinalPreview = ({ formData, setFormData }) => {
  const enterpriseId = getEnterpriseId();
  const translations = useTranslations('components.create_edit_order');
  const [url, setUrl] = useState(null);

  const {
    isPINError,
    setIsPINError,
    invoiceMutation,
    handleSubmit,
    handlePreview,
  } = useB2BInvoiceActions({
    order: formData,
    fields: formData._formFields,
    isGstApplicableForSalesOrders: formData.isGstApplicableForSalesOrders,
    isOrder: formData.isOrder,
    translations,
    setUrl,
    setIsInvoicePreview: () => {}, // We don't use this state in multi-step
    activeWorkflowData: formData.activeWorkflowData, // We will inject this from parent
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
        getAddressRelatedData={{
          clientId: formData.buyerId,
          clientEnterpriseId: enterpriseId,
        }}
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

export default FinalPreview;
