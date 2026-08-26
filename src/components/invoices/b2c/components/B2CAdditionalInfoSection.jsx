import React from 'react';
import { saveDraftToSession } from '@/appUtils/helperFunctions';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';

export default function B2CAdditionalInfoSection({
  fields,
  handleSetFields,
  order,
  setOrder,
  baseVersion,
  etag,
  originalCustomFields,
  originalSystemFields,
  revision,
  handleSaveSuccess,
  errorMsg,
  isDeveloperMode,
}) {
  const hasCustomFields = fields.some((f) => f.kind === 'CUSTOM');
  if (!hasCustomFields && !isDeveloperMode) return null;

  return (
    <div className="flex-shrink-0">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
        Additional Information
      </span>
      <section className="border-b bg-white p-5 shadow-none">
        <DynamicFormRenderer
          module="B2CINVOICE"
          fields={fields}
          setFields={handleSetFields}
          formData={order}
          allowAddField={true}
          baseVersion={baseVersion}
          etag={etag}
          originalCustomFields={originalCustomFields}
          originalSystemFields={originalSystemFields}
          revision={revision}
          onSaveSuccess={handleSaveSuccess}
          filterFn={(f) => f.kind === 'CUSTOM'}
          onChange={(key, value) => {
            const updatedOrder = {
              ...order,
              [key]: value,
              customFields: {
                ...(order.customFields || {}),
                [key]: value,
              },
            };
            setOrder(updatedOrder);
            saveDraftToSession({
              key: 'b2CInvoiceDraft',
              data: updatedOrder,
            });
          }}
          errors={errorMsg}
        />
      </section>
    </div>
  );
}
