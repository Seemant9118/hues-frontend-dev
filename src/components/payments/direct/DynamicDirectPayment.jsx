import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import { useDeveloperMode } from '@/context/DeveloperModeContext';
import { SessionStorageService } from '@/lib/utils';
import Wrapper from '../../wrappers/Wrapper';

import DirectPaymentAdditionalInfoSection from './components/DirectPaymentAdditionalInfoSection';
import DirectPaymentDetailsSection from './components/DirectPaymentDetailsSection';
import DirectPaymentFooter from './components/DirectPaymentFooter';
import DirectPaymentProofSection from './components/DirectPaymentProofSection';
import { useDirectPaymentActions } from './hooks/useDirectPaymentActions';
import { useDirectPaymentFormConfig } from './hooks/useDirectPaymentFormConfig';
import { useDirectPaymentQueries } from './hooks/useDirectPaymentQueries';

const DynamicDirectPayment = ({ setIsPaymentRecording }) => {
  const enterpriseId = useMemo(() => getEnterpriseId(), []);
  const translations = useTranslations('components.make_payment');

  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');
  const contextType = isPurchasePage ? 'PAYMENT_ADVICE' : 'PAYMENT';

  const draftKey = isPurchasePage
    ? 'orderPaymentAdviceDraft'
    : 'orderPaymentRecordDraft';

  // Lazy Initializer for payment state
  const [paymentData, setPaymentData] = useState(() => {
    const paymentDraft = SessionStorageService.get(draftKey);
    return {
      balance: paymentDraft?.balance || '',
      amount: paymentDraft?.amount || '',
      paymentMode: paymentDraft?.paymentMode || '',
      transactionId: paymentDraft?.transactionId || '',
      invoiceId: paymentDraft?.invoiceId || null,
      orderId: paymentDraft?.orderId || null,
      invoices: paymentDraft?.invoices || [],
      bankAccountId: paymentDraft?.bankAccountId || '',
      paymentDate: paymentDraft?.paymentDate || null,
    };
  });

  const { isDeveloperMode } = useDeveloperMode();

  // Dynamic Form Config Hook
  const {
    fields,
    baseVersion,
    revision,
    etag,
    originalCustomFields,
    originalSystemFields,
    handleSetFields,
    handleSaveSuccess,
  } = useDirectPaymentFormConfig({ enterpriseId, setPaymentData });

  // Custom Queries Hook
  const { searchTerm, setSearchTerm, invoices, bankAccounts } =
    useDirectPaymentQueries({
      enterpriseId,
      isPurchasePage,
      paymentData,
      setPaymentData,
    });

  // Custom Actions Hook
  const {
    errorMsg,
    setErrorMsg,
    files,
    handleInputChange,
    handleAttached,
    handleFileRemove,
    createPaymentMutationFn,
    handleSubmit,
  } = useDirectPaymentActions({
    paymentData,
    setPaymentData,
    fields,
    isPurchasePage,
    contextType,
    draftKey,
    translations,
  });

  return (
    <Wrapper className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50/40">
      <div className="scrollBarStyles flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {/* 1. Payment Details Section */}
          <DirectPaymentDetailsSection
            fields={fields}
            handleSetFields={handleSetFields}
            paymentData={paymentData}
            setPaymentData={setPaymentData}
            baseVersion={baseVersion}
            etag={etag}
            originalCustomFields={originalCustomFields}
            originalSystemFields={originalSystemFields}
            revision={revision}
            handleSaveSuccess={handleSaveSuccess}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
            isPurchasePage={isPurchasePage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            invoices={invoices}
            bankAccounts={bankAccounts}
            handleInputChange={handleInputChange}
          />

          {/* 2. Custom Fields Section */}
          <DirectPaymentAdditionalInfoSection
            fields={fields}
            handleSetFields={handleSetFields}
            paymentData={paymentData}
            setPaymentData={setPaymentData}
            baseVersion={baseVersion}
            etag={etag}
            originalCustomFields={originalCustomFields}
            originalSystemFields={originalSystemFields}
            revision={revision}
            handleSaveSuccess={handleSaveSuccess}
            errorMsg={errorMsg}
            isDeveloperMode={isDeveloperMode}
            isPurchasePage={isPurchasePage}
          />

          {/* 3. Upload Payment Proof Section */}
          <DirectPaymentProofSection
            files={files}
            handleAttached={handleAttached}
            handleFileRemove={handleFileRemove}
            translations={translations}
          />
        </div>
      </div>

      {/* 4. Action Footer */}
      <DirectPaymentFooter
        setIsPaymentRecording={setIsPaymentRecording}
        setErrorMsg={setErrorMsg}
        setPaymentData={setPaymentData}
        handleSubmit={handleSubmit}
        isPending={createPaymentMutationFn.isPending}
        translations={translations}
      />
    </Wrapper>
  );
};

export default DynamicDirectPayment;
