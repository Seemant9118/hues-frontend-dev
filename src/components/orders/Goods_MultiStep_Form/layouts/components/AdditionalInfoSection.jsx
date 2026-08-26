import React from 'react';

import { saveDraftToSession } from '@/appUtils/helperFunctions';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';

export const AdditionalInfoSection = ({
  isOffer,
  order,
  setOrder,
  fields,
  handleSetFields,
  baseVersion,
  etag,
  originalCustomFields,
  originalSystemFields,
  revision,
  handleSaveSuccess,
  errorMsg,
  isDeveloperMode,
  cta,
}) => {
  const hasCustomFields = fields.some((f) => f.kind === 'CUSTOM');
  if (!hasCustomFields && !isDeveloperMode) return null;

  return (
    <div className="flex-shrink-0">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary">
        Additional Information
      </span>
      <section className="border-b bg-white p-2 shadow-none">
        <DynamicFormRenderer
          module={isOffer ? 'SALES_ORDER' : 'PURCHASE_ORDER'}
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
          onChange={(key, value) => {
            const updatedOrder = { ...order, [key]: value };
            setOrder(updatedOrder);
            saveDraftToSession({ cta, data: updatedOrder });
          }}
          errors={errorMsg}
          filterFn={(f) => f.kind === 'CUSTOM'}
        />
      </section>
    </div>
  );
};
