'use client';

import React from 'react';

import FormTypeModal from '@/components/Modals/FormTypeModal';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';

import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';

import FormCardGrid from '@/app/[locale]/(dashboard)/dashboard/templates/_forms_shared/components/FormCardGrid';
import { useFormsListing } from '@/app/[locale]/(dashboard)/dashboard/templates/_forms_shared/hooks/useFormsListing';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function FormsListingShared({ isCustomRoute }) {
  const activeTab = isCustomRoute ? 'custom' : 'system';

  const isFeatureEnabled = useFeatureFlag('BUILDER_FORMS');
  const { hasPermission } = usePermission();
  const hasConfigPermission = hasPermission('permission:form-config-manage');

  const {
    customForms,
    systemForms,
    isLoadingCustom,
    isLoadingSystem,
    activeMenu,
    setActiveMenu,
    isModalOpen,
    setIsModalOpen,
    handleContinueFormType,
    handleDelete,
    handleEdit,
    handleShare,
    handleCardClick,
  } = useFormsListing(isFeatureEnabled, hasConfigPermission, activeTab);

  return (
    <FeatureFlagWrapper flag="BUILDER_FORMS" redirectTo="/dashboard">
      <ProtectedWrapper permissionCode="permission:form-config-manage">
        <Wrapper>
          {/* Sub Header & CTA */}
          <div className="flex items-end justify-between">
            <SubHeader name={isCustomRoute ? 'Custom Forms' : 'System Forms'} />
            {isCustomRoute && (
              <Button onClick={() => setIsModalOpen(true)} size="sm">
                <Plus size={14} /> Create a new Custom Form
              </Button>
            )}
          </div>

          <div>
            {!isCustomRoute ? (
              isLoadingSystem ? (
                <div className="py-20 text-center">
                  <Loading />
                </div>
              ) : (
                <FormCardGrid
                  formsList={systemForms}
                  emptyLabel="No system forms found"
                  isCustomTab={false}
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                  onCardClick={handleCardClick}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onShare={handleShare}
                  onOpenCreateModal={() => setIsModalOpen(true)}
                />
              )
            ) : isLoadingCustom ? (
              <div className="py-20 text-center">
                <Loading />
              </div>
            ) : (
              <FormCardGrid
                formsList={customForms}
                emptyLabel="No custom forms found"
                isCustomTab={true}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                onCardClick={handleCardClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShare={handleShare}
                onOpenCreateModal={() => setIsModalOpen(true)}
              />
            )}
          </div>

          <FormTypeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onContinue={handleContinueFormType}
            title="Create New Custom Form"
            description="Enter the form type to start building your dynamic form layout."
          />
        </Wrapper>
      </ProtectedWrapper>
    </FeatureFlagWrapper>
  );
}
