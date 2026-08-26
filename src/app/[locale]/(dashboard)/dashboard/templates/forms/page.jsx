'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, FileText, LayoutGrid, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import FormTypeModal from '@/components/Modals/FormTypeModal';
import CreateNewFormCard from '@/components/templates/CreateNewFormCard';
import TemplateCard from '@/components/templates/TemplateCard';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';
import { getAllCustomForms } from '@/services/Custom_Form_Services/CustomFormServices';
import { getAllSystemFormConfigs } from '@/services/Form_Config_Services/FormConfigServices';
import { deleteTemplate } from '@/services/template-builder/TemplateBuilderServices';

export default function FormsListingPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('system');

  const isFeatureEnabled = useFeatureFlag('BUILDER_FORMS');
  const { hasPermission } = usePermission();
  const hasConfigPermission = hasPermission('permission:form-config-manage');

  const handleContinueFormType = (type) => {
    setIsModalOpen(false);
    router.push(`/dashboard/templates/forms/create?type=${type}`);
  };

  // Fetch custom forms (GET /custom-forms)
  const { data: apiCustomForms = [], isLoading: isLoadingCustom } = useQuery({
    queryKey: ['get_all_custom_forms'],
    queryFn: getAllCustomForms,
    enabled: isFeatureEnabled && hasConfigPermission && activeTab === 'custom',
  });

  // Fetch system form configurations (GET /form-configurations)
  const { data: apiSystemForms = [], isLoading: isLoadingSystem } = useQuery({
    queryKey: ['get_all_system_form_configs'],
    queryFn: getAllSystemFormConfigs,
    enabled: isFeatureEnabled && hasConfigPermission && activeTab === 'system',
  });

  // Map custom forms for card display
  const customForms = useMemo(() => {
    if (!Array.isArray(apiCustomForms)) return [];
    const apiMapped = apiCustomForms.map((t) => {
      const { name } = t;
      const versionVal =
        t.activeRevision === 0 ? t.baseVersion : t.activeRevision;
      const version =
        typeof versionVal === 'number' ? `v${versionVal}.0` : versionVal;
      const targetId = t.id;

      return {
        id: targetId,
        formId: t.id,
        name,
        status: t.status || 'Published',
        version,
        lastSaved:
          t.updatedAt || t.createdAt
            ? new Date(t.updatedAt || t.createdAt).toLocaleDateString()
            : 'Just now',
        updatedAt: t.updatedAt || t.createdAt || new Date().toISOString(),
        isDefault: false,
        module: targetId,
        isCustom: true,
        formType: 'CUSTOM',
      };
    });

    return [...apiMapped].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  }, [apiCustomForms]);

  // Map system forms for card display
  const systemForms = useMemo(() => {
    if (!Array.isArray(apiSystemForms)) return [];
    const apiMapped = apiSystemForms.map((t) => {
      const name =
        t.label ||
        t.name ||
        t.moduleName ||
        (t.module ? convertSnakeToTitleCase(t.module) : 'Form Configuration');
      const versionVal =
        t.activeRevision === 0
          ? t.baseVersion
          : (t.activeRevision ?? t.version ?? 1);
      const version =
        typeof versionVal === 'number' ? `v${versionVal}.0` : versionVal;
      const targetId = t.module || t.id;

      return {
        id: targetId,
        formId: t.id,
        name,
        status: t.status || (t.isPublished ? 'Published' : 'Draft'),
        version,
        lastSaved:
          t.updatedAt || t.createdAt
            ? new Date(t.updatedAt || t.createdAt).toLocaleDateString()
            : 'Just now',
        updatedAt: t.updatedAt || t.createdAt || new Date().toISOString(),
        isDefault: false,
        module: targetId,
        isCustom: false,
        formType: 'SYSTEM',
      };
    });

    return [...apiMapped].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  }, [apiSystemForms]);

  // Mutation for deleting form
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTemplate(id),
    onSuccess: () => {
      toast.success('Form deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['get_all_custom_forms'] });
      queryClient.invalidateQueries({
        queryKey: ['get_all_system_form_configs'],
      });
      setActiveMenu(null);
    },
    onError: (err) => {
      const errorMsg = err?.response?.data?.message || 'Failed to delete form.';
      toast.error(errorMsg);
    },
  });

  const handleDelete = (form, e) => {
    e.stopPropagation();
    e.preventDefault();

    if (form.isDefault) {
      toast.error('Default forms cannot be deleted.');
      return;
    }

    if (form.status === 'Published') {
      toast.error(
        'Active published forms cannot be deleted without unpublishing first.',
      );
      return;
    }

    deleteMutation.mutate(form.id);
  };

  const handleEdit = (form, e) => {
    e.stopPropagation();
    e.preventDefault();
    const typeParam =
      form.isCustom || form.formType === 'CUSTOM' ? 'CUSTOM' : 'SYSTEM';
    router.push(`/dashboard/templates/forms/${form.id}?type=${typeParam}`);
  };

  const renderFormGrid = (formsList, emptyLabel, isCustomTab = false) => {
    if (formsList.length === 0 && !isCustomTab) {
      return (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-neutral-800">
            {emptyLabel}
          </h3>
          <p className="mt-2 max-w-sm text-xs text-neutral-500">
            No system forms configured yet.
          </p>
        </div>
      );
    }

    if (formsList.length === 0 && isCustomTab) {
      return (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-neutral-800">
            {emptyLabel}
          </h3>
          <p className="mt-2 max-w-sm text-xs text-neutral-500">
            Start building a dynamic custom form layout from scratch.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary"
          >
            <Plus size={14} />
            Create a new custom form
          </button>
        </div>
      );
    }

    return (
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {/* Create New Form Card (Custom Forms Only) */}
        {isCustomTab && (
          <CreateNewFormCard onClick={() => setIsModalOpen(true)} />
        )}

        {/* Dynamic Form Cards */}
        {formsList.map((form) => (
          <TemplateCard
            key={form.id}
            template={form}
            onClick={() => {
              const typeParam =
                form.isCustom || form.formType === 'CUSTOM'
                  ? 'CUSTOM'
                  : 'SYSTEM';
              router.push(
                `/dashboard/templates/forms/${form.id}?type=${typeParam}`,
              );
            }}
            onEdit={(id, e) => handleEdit(form, e)}
            onDelete={form.isCustom ? handleDelete : undefined}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            editLabel="Edit Form"
            deleteLabel="Delete Form"
          />
        ))}
      </div>
    );
  };

  return (
    <FeatureFlagWrapper flag="BUILDER_FORMS" redirectTo="/dashboard">
      <ProtectedWrapper permissionCode="permission:form-config-manage">
        <Wrapper>
          {/* Sub Header */}
          <SubHeader name="Forms" />

          {/* Form Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-2 w-full"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <TabsList className="border border-neutral-200 bg-neutral-100/60 p-1">
                <TabsTrigger value="system">System Forms</TabsTrigger>
                <TabsTrigger value="custom">Custom Forms</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5 font-medium text-neutral-500">
                  <LayoutGrid size={16} />
                  <span>Grid View</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>Sorted by last modified</span>
                </div>
              </div>
            </div>

            {/* System Forms Tab */}
            <TabsContent value="system" className="mt-3">
              {isLoadingSystem ? (
                <div className="py-20 text-center">
                  <Loading />
                </div>
              ) : (
                renderFormGrid(systemForms, 'No system forms found', false)
              )}
            </TabsContent>

            {/* Custom Forms Tab */}
            <TabsContent value="custom" className="mt-3">
              {isLoadingCustom ? (
                <div className="py-20 text-center">
                  <Loading />
                </div>
              ) : (
                renderFormGrid(customForms, 'No custom forms found', true)
              )}
            </TabsContent>
          </Tabs>

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
