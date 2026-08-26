'use client';

import { useStandaloneFormFiller } from '@/components/custom-forms/hooks/useStandaloneFormFiller';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { ArrowLeft, FileText, Send } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

export default function StandaloneFormFillerPage() {
  const params = useParams();
  const formId = params?.id;
  const router = useRouter();

  const {
    form,
    fields,
    formData,
    errors,
    isLoadingSchema,
    isSubmitting,
    schemaError,
    handleChange,
    handleSubmit,
  } = useStandaloneFormFiller(formId);

  const formName = form?.name;
  const formDescription = form?.description;

  return (
    <ProtectedWrapper permissionCode="permission:view-dashboard">
      <Wrapper className="flex flex-col justify-between">
        <div className="flex flex-col gap-3">
          {/* Navigation Top Header */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard/custom-forms')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
            >
              <ArrowLeft size={16} />
            </button>
            <SubHeader name={formName} />
          </div>

          {/* Loading state */}
          {isLoadingSchema ? (
            <div className="py-24 text-center">
              <Loading />
            </div>
          ) : schemaError || !form ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 p-12 text-center">
              <h3 className="text-base font-bold text-red-800">
                Form Not Found
              </h3>
              <p className="mt-1 text-xs text-red-600">
                Could not load custom form configuration for ID #{formId}.
              </p>
              <button
                type="button"
                onClick={() => router.push('/dashboard/custom-forms')}
                className="mt-4 rounded-lg bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-900"
              >
                Return to Custom Forms
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-3">
                {/* Form Banner Card */}
                <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-primary">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-neutral-800">
                        {formName}
                      </h2>
                      <p className="mt-1 text-xs text-neutral-500">
                        {formDescription}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                          Revision v{form.activeRevision ?? form.revision ?? 0}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-medium text-neutral-600">
                          {fields.length} Fields
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Form Renderer Container */}
                <div className="rounded-sm bg-gray-50 px-2 py-4">
                  <DynamicFormRenderer
                    module={String(formId)}
                    fields={fields}
                    setFields={() => {}}
                    formData={formData}
                    onChange={handleChange}
                    errors={errors}
                    allowAddField={false}
                    showSaveControls={false}
                    isConfigurable={false}
                    isCustom={true}
                  />
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="sticky bottom-2 z-20 flex items-center justify-end gap-3 bg-white p-4">
                <Button
                  type="button"
                  onClick={() => router.push('/dashboard/custom-forms')}
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} size="sm">
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Form</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Wrapper>
    </ProtectedWrapper>
  );
}
