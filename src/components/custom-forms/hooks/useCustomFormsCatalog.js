'use client';

import { getAllCustomForms } from '@/services/Custom_Form_Services/CustomFormServices';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export const useCustomFormsCatalog = ({ activeTab }) => {
  const {
    data: rawCustomForms = [],
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ['get_all_custom_forms_catalog'],
    queryFn: getAllCustomForms,
    enabled: activeTab === 'catalog',
  });

  const customForms = useMemo(() => {
    if (!Array.isArray(rawCustomForms)) return [];

    const formatted = rawCustomForms.map((item) => {
      const versionVal =
        item.activeRevision === 0 || item.activeRevision === undefined
          ? (item.baseVersion ?? 1)
          : item.activeRevision;
      const version =
        typeof versionVal === 'number' ? `v${versionVal}.0` : versionVal;

      return {
        id: item.id,
        formKey: item.formKey || item.id,
        name: item.name || item.module || `Custom Form #${item.id}`,
        description: item.description || 'Custom dynamic form',
        status: item.status || 'PUBLISHED',
        usageMode: item.usageMode || 'BOTH',
        version,
        baseVersion: item.baseVersion ?? 1,
        revision: item.activeRevision ?? 0,
        fieldsCount: Array.isArray(item.customFields)
          ? item.customFields.length
          : Array.isArray(item.fields)
            ? item.fields.length
            : 0,
        updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
      };
    });

    return formatted;
  }, [rawCustomForms]);

  return {
    customForms,
    isLoading,
    isRefetching,
    refetch,
    error,
  };
};
