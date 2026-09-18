'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import { getAllCustomForms } from '@/services/Custom_Form_Services/CustomFormServices';
import { getAllSystemFormConfigs } from '@/services/Form_Config_Services/FormConfigServices';
import { deleteTemplate } from '@/services/template-builder/TemplateBuilderServices';

export function useFormsListing(
  isFeatureEnabled,
  hasConfigPermission,
  activeTab,
) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleContinueFormType = (type) => {
    setIsModalOpen(false);
    router.push(`/dashboard/templates/custom-forms/create?type=${type}`);
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
    const isCustom = form.isCustom || form.formType === 'CUSTOM';
    const basePath = isCustom ? 'custom-forms' : 'system-forms';
    router.push(`/dashboard/templates/${basePath}/${form.id}`);
  };

  const handleShare = (form, e) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/dashboard/templates/custom-forms/${form.id}?tab=share`);
  };

  const handleCardClick = (form) => {
    const isCustom = form.isCustom || form.formType === 'CUSTOM';
    const basePath = isCustom ? 'custom-forms' : 'system-forms';
    router.push(`/dashboard/templates/${basePath}/${form.id}`);
  };

  return {
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
  };
}
