'use client';

import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { getCustomForm } from '@/services/Custom_Form_Services/CustomFormServices';
import { getFormConfig } from '@/services/Form_Config_Services/FormConfigServices';
import { sortNodesTopologically } from '@/utils/workflowGraphTransformer';

export function usePreviousNodesFields({
  nodes = [],
  edges = [],
  currentNodeId,
  moduleName = 'ORDER',
  isOpen = true,
}) {
  // 1. Determine preceding nodes relative to currentNodeId
  const precedingNodes = useMemo(() => {
    if (!currentNodeId || nodes.length <= 1) return [];

    const currentNode = nodes.find(
      (n) => n.id === currentNodeId || n.content?.key === currentNodeId,
    );
    const isCurrentSystemStart =
      currentNode?.type === 'SYSTEM' || Boolean(currentNode?.content?.start);

    // Initial start nodes cannot have preceding nodes
    if (isCurrentSystemStart) return [];

    const ordered = sortNodesTopologically(nodes, edges);
    const currentIndex = ordered.findIndex(
      (n) => (n.id || n.content?.key) === currentNodeId,
    );

    if (currentIndex > 0) {
      return ordered.slice(0, currentIndex).filter((n) => n.type !== 'END');
    }

    return [];
  }, [nodes, edges, currentNodeId]);

  // Check if system form is needed among preceding nodes
  const hasSystemStartInPreceding = useMemo(() => {
    return precedingNodes.some((n) => n.type === 'SYSTEM' || n.content?.start);
  }, [precedingNodes]);

  // Query System Form schema if needed
  const { data: systemFormConfig, isLoading: isSysLoading } = useQuery({
    queryKey: ['get_form_config_preceding', moduleName],
    queryFn: () => getFormConfig(moduleName),
    enabled: Boolean(
      isOpen &&
      hasSystemStartInPreceding &&
      moduleName !== 'CUSTOM' &&
      moduleName !== 'CUSTOM_WORKFLOW',
    ),
    select: (res) => res?.data?.data || res || null,
  });

  // Unique list of custom formConfigurationIds from preceding nodes
  const customFormIds = useMemo(() => {
    const ids = new Set();
    precedingNodes.forEach((n) => {
      const formId = n.content?.formConfigurationId;
      if (formId && n.type === 'FORM') {
        ids.add(Number(formId));
      }
    });
    return Array.from(ids);
  }, [precedingNodes]);

  // Query Custom Form schemas for all preceding custom forms
  const customFormQueries = useQueries({
    queries: customFormIds.map((formId) => ({
      queryKey: ['get_custom_form_preceding', formId],
      queryFn: () => getCustomForm(formId),
      enabled: Boolean(isOpen && formId),
      select: (res) => res?.data?.data || res || null,
    })),
  });

  const isCustomLoading = customFormQueries.some((q) => q.isLoading);

  // Map custom form details by formId
  const customFormsMap = useMemo(() => {
    const map = {};
    customFormIds.forEach((formId, idx) => {
      const data = customFormQueries[idx]?.data;
      if (data) {
        map[formId] = data;
      }
    });
    return map;
  }, [customFormIds, customFormQueries]);

  // Build combined list of source options: "forms.<NODE_KEY>.values.<FIELD_KEY>"
  const sourceOptions = useMemo(() => {
    const options = [];

    precedingNodes.forEach((node) => {
      const nodeKey = node.id || node.content?.key;
      const nodeLabel = node.name || node.content?.label || nodeKey;
      const isSystem = node.type === 'SYSTEM' || node.content?.start;
      const formId = node.content?.formConfigurationId;

      let fields = [];
      if (isSystem && systemFormConfig?.fields) {
        fields = systemFormConfig.fields;
      } else if (formId && customFormsMap[formId]?.fields) {
        fields = customFormsMap[formId].fields;
      }

      fields.forEach((field) => {
        const fieldKey = field.mappingKey || field.key || field.backendKey;
        if (!fieldKey) return;
        const fieldLabel = field.label || field.key || fieldKey;
        const sourcePath = `forms.${nodeKey}.values.${fieldKey}`;

        options.push({
          sourcePath,
          label: `${nodeLabel} (${nodeKey}) → ${fieldLabel} (${fieldKey})`,
          nodeKey,
          nodeLabel,
          fieldKey,
          fieldLabel,
          fieldType: field.type || 'TEXT',
        });
      });
    });

    return options;
  }, [precedingNodes, systemFormConfig, customFormsMap]);

  return {
    precedingNodes,
    sourceOptions,
    isLoading: isSysLoading || isCustomLoading,
  };
}
