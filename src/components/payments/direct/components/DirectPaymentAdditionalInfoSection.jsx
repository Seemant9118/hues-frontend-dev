import React from 'react';
import { saveDraftToSession } from '@/appUtils/helperFunctions';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';

function saveDraft({ isPurchasePage, data }) {
  if (saveDraftToSession) {
    saveDraftToSession({ isPurchasePage, data });
  }
}

export default function DirectPaymentAdditionalInfoSection({
  fields,
  handleSetFields,
  paymentData,
  setPaymentData,
  baseVersion,
  etag,
  originalCustomFields,
  originalSystemFields,
  revision,
  handleSaveSuccess,
  errorMsg,
  isDeveloperMode,
  isPurchasePage,
}) {
  const hasCustomFields = fields.some((f) => f.kind === 'CUSTOM');
  if (!hasCustomFields && !isDeveloperMode) return null;

  return (
    <div className="flex-shrink-0">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
        Additional Information
      </span>
      <section className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
        <DynamicFormRenderer
          module="PAYMENT"
          fields={fields}
          setFields={handleSetFields}
          formData={paymentData}
          allowAddField={true}
          baseVersion={baseVersion}
          etag={etag}
          originalCustomFields={originalCustomFields}
          originalSystemFields={originalSystemFields}
          revision={revision}
          onSaveSuccess={handleSaveSuccess}
          filterFn={(f) => f.kind === 'CUSTOM'}
          onChange={(key, value) => {
            const updated = {
              ...paymentData,
              [key]: value,
              customFields: {
                ...(paymentData.customFields || {}),
                [key]: value,
              },
            };
            setPaymentData(updated);
            saveDraft({
              isPurchasePage,
              data: updated,
            });
          }}
          errors={errorMsg}
        />
      </section>
    </div>
  );
}
