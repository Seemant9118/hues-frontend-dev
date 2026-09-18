import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, FileSpreadsheet, User } from 'lucide-react';
import {
  getTemplateDetails,
  getVariables,
} from '@/services/template-builder/TemplateBuilderServices';

export function useTemplateBuilderQueries({
  templateId,
  isFeatureEnabled,
  hasConfigPermission,
}) {
  // Fetch pre-registered variables
  const { data: apiVariables = [] } = useQuery({
    queryKey: ['get_builder_variables'],
    queryFn: () => getVariables().then((res) => res.data?.data || []),
    enabled: isFeatureEnabled && hasConfigPermission,
  });

  // Categorize variables for Variable Library UI
  const dynamicVariableLibrary = useMemo(() => {
    if (!apiVariables || apiVariables.length === 0) return [];

    const categoriesMap = {};
    apiVariables.forEach((v) => {
      const cat = v.category || 'Standard';
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = [];
      }
      categoriesMap[cat].push({
        id: v.key,
        label: v.key,
        description: v.description,
      });
    });

    const getCategoryIcon = (category) => {
      switch (category.toLowerCase()) {
        case 'user':
          return <User size={13} className="text-blue-500" />;
        case 'enterprise':
        case 'client':
          return <Building2 size={13} className="text-purple-500" />;
        default:
          return <FileSpreadsheet size={13} className="text-emerald-500" />;
      }
    };

    return Object.keys(categoriesMap).map((catName) => ({
      category: catName,
      icon: getCategoryIcon(catName),
      items: categoriesMap[catName],
    }));
  }, [apiVariables]);

  // Fetch template details for edit mode
  const { data: apiTemplateDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['get_builder_template', templateId],
    queryFn: () =>
      getTemplateDetails(templateId).then((res) => {
        const firstLevel = res.data?.data;
        // Check for double-nested data in raw API response
        if (
          firstLevel &&
          typeof firstLevel === 'object' &&
          'data' in firstLevel
        ) {
          return firstLevel.data;
        }
        return firstLevel || res.data;
      }),
    enabled: isFeatureEnabled && hasConfigPermission && !!templateId,
  });

  return {
    dynamicVariableLibrary,
    apiTemplateDetails,
    isLoadingDetails,
  };
}
