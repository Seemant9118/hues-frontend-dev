'use client';

import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { FileText, Plus, ScrollText, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { CustomFormCard } from '@/components/custom-forms/components/CustomFormCard';
import { FormSubmissionsTable } from '@/components/custom-forms/components/FormSubmissionsTable';
import { SubmissionDetailModal } from '@/components/custom-forms/components/SubmissionDetailModal';
import { useCustomFormsCatalog } from '@/components/custom-forms/hooks/useCustomFormsCatalog';
import { useFormSubmissionsList } from '@/components/custom-forms/hooks/useFormSubmissionsList';
import { Button } from '@/components/ui/button';
import { useDeveloperMode } from '@/context/DeveloperModeContext';

export default function CustomFormsHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('catalog');
  const { isDeveloperMode } = useDeveloperMode();

  // Custom Forms Catalog Hook
  const { customForms, isLoading: isLoadingCatalog } = useCustomFormsCatalog({
    activeTab,
  });

  // Form Submissions History Hook
  const {
    submissions,
    isLoading: isLoadingSubmissions,
    isRefetching: isRefetchingSubmissions,
    refetch: refetchSubmissions,
    selectedFormId,
    setSelectedFormId,
    selectedSubmission,
    isDetailModalOpen,
    handleViewDetails,
    handleCloseDetails,
  } = useFormSubmissionsList({ activeTab });

  return (
    <ProtectedWrapper permissionCode="permission:view-dashboard">
      <Wrapper>
        {/* Header */}
        <SubHeader name="Custom Forms" />

        {/* Enterprise Navigation Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-2 w-full"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="catalog" className="flex items-center gap-2">
                <FileText size={15} />
                <span>Available Forms ({customForms.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="flex items-center gap-2"
              >
                <ScrollText size={15} />
                <span>Form Submissions ({submissions.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Catalog Actions */}
            {activeTab === 'catalog' && isDeveloperMode && (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  type="button"
                  onClick={() => router.push('/dashboard/studio')}
                >
                  <Wrench size={14} />
                  <span>Studio</span>
                </Button>
              </div>
            )}
          </div>

          {/* Catalog Tab Content */}
          <TabsContent value="catalog">
            {isLoadingCatalog ? (
              <div className="py-20 text-center">
                <Loading />
              </div>
            ) : customForms.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-base font-bold text-neutral-800">
                  No Standalone Custom Forms Available
                </h3>
                <p className="mt-2 max-w-sm text-xs text-neutral-500">
                  {isDeveloperMode
                    ? 'No active standalone custom forms have been created yet. You can create new forms in Studio.'
                    : 'No active standalone custom forms have been created yet.'}
                </p>
                {isDeveloperMode && (
                  <Button
                    type="button"
                    onClick={() => router.push('/dashboard/studio')}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow transition"
                  >
                    <Plus size={14} />
                    <span>Go to Studio</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                {customForms.map((form) => (
                  <CustomFormCard key={form.id} form={form} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Submissions Tab Content */}
          <TabsContent value="submissions">
            <FormSubmissionsTable
              submissions={submissions}
              isLoading={isLoadingSubmissions}
              isRefetching={isRefetchingSubmissions}
              onRefresh={refetchSubmissions}
              customFormsList={customForms}
              selectedFormId={selectedFormId}
              onFormFilterChange={setSelectedFormId}
              onInspect={handleViewDetails}
            />
          </TabsContent>
        </Tabs>

        {/* Submission Response Inspector Modal */}
        <SubmissionDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetails}
          submission={selectedSubmission}
        />
      </Wrapper>
    </ProtectedWrapper>
  );
}
