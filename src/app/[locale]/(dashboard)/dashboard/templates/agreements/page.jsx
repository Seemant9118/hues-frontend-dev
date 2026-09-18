/* eslint-disable no-console */

'use client';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import TemplateCard from '@/components/templates/TemplateCard';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import Wrapper from '@/components/wrappers/Wrapper';

import TemplateTypeModal from '@/components/Modals/TemplateTypeModal';
import { Button } from '@/components/ui/button';
import AgreementShareModal from '@/components/Modals/AgreementShareModal';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import {
  deleteTemplate,
  getTemplates,
} from '@/services/template-builder/TemplateBuilderServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';

export default function TemplatesListingPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const enterpriseId = getEnterpriseId();
  const [activeMenu, setActiveMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sharingAgreement, setSharingAgreement] = useState(null);

  const isFeatureEnabled = useFeatureFlag('BUILDER_TEMPLATES');
  const { hasPermission } = usePermission();
  const hasConfigPermission = hasPermission('permission:form-config-manage');

  const handleSelectType = (type) => {
    setIsModalOpen(false);
    router.push(`/dashboard/template-builder?type=${type}`);
  };

  // Load templates from API using React Query
  const { data: apiTemplates = [], isLoading } = useQuery({
    queryKey: ['get_builder_templates', enterpriseId],
    queryFn: () =>
      getTemplates({ enterpriseId }).then((res) => res.data?.data || []),
    enabled: isFeatureEnabled && hasConfigPermission && !!enterpriseId,
  });

  // Combine API templates and default static templates
  const templates = React.useMemo(() => {
    const apiMapped = apiTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      status: t.isPublished ? 'Published' : 'Draft',
      version:
        typeof t.version === 'number' ? `v${t.version}.0` : t.version || 'v1.0',
      lastSaved: t.createdAt
        ? new Date(t.createdAt).toLocaleDateString()
        : 'Just now',
      updatedAt: t.createdAt || new Date().toISOString(),
      isDefault: false,
    }));

    return [...apiMapped].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  }, [apiTemplates]);

  // Mutation for deleting template
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTemplate(id),
    onSuccess: () => {
      toast.success('Template deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['get_builder_templates'] });
      setActiveMenu(null);
    },
    onError: (err) => {
      const errorMsg =
        err?.response?.data?.message || 'Failed to delete template.';
      toast.error(errorMsg);
    },
  });

  const handleDelete = (template, e) => {
    e.stopPropagation();
    e.preventDefault();

    if (template.isDefault) {
      toast.error('Default templates cannot be deleted.');
      return;
    }

    if (template.status === 'Published') {
      toast.error(
        'Active published templates cannot be deleted without unpublishing first.',
      );
      return;
    }

    deleteMutation.mutate(template.id);
  };

  const handleEdit = (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/dashboard/template-builder?id=${id}`);
  };

  return (
    <FeatureFlagWrapper flag="BUILDER_TEMPLATES" redirectTo="/dashboard">
      <ProtectedWrapper permissionCode="permission:form-config-manage">
        <Wrapper>
          {/* Sub Header & CTA */}
          <div className="flex items-end justify-between">
            <SubHeader name="Agreements" />
            <Button onClick={() => setIsModalOpen(true)} size="sm">
              <Plus size={16} className="mr-2" />
              Create a new Agreement
            </Button>
          </div>

          {isLoading ? (
            <div className="py-20 text-center">
              <Loading />
            </div>
          ) : templates.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-neutral-800">
                No templates found
              </h3>
              <p className="mt-2 max-w-sm text-xs text-neutral-500">
                Start building a customized agreement from scratch.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary"
              >
                <Plus size={14} />
                Create a new template
              </button>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {/* Template Cards */}
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() =>
                    router.push(`/dashboard/template-builder?id=${template.id}`)
                  }
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onShare={(id, e) => {
                    e.stopPropagation();
                    setActiveMenu(null);
                    setSharingAgreement(template);
                  }}
                  shareLabel="Share Agreement"
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                />
              ))}
            </div>
          )}
          <TemplateTypeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelect={handleSelectType}
            title="Select Template Type"
            description="What type of template do you want to create?"
          />
          {sharingAgreement && (
            <AgreementShareModal
              isOpen={!!sharingAgreement}
              onClose={() => setSharingAgreement(null)}
              agreement={sharingAgreement}
            />
          )}
        </Wrapper>
      </ProtectedWrapper>
    </FeatureFlagWrapper>
  );
}
