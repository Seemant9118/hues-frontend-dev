'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getAllCustomForms,
  getCustomForm,
} from '@/services/Custom_Form_Services/CustomFormServices';
import { getFormConfig } from '@/services/Form_Config_Services/FormConfigServices';
import { getRoles } from '@/services/Roles_Services/Roles_Services';

export function useNodeDetailsQueries({
  isOpen,
  node,
  moduleName = 'ORDER',
  nodeType,
  isSystemStart,
  formConfigId,
}) {
  const { data: systemFormConfig, isLoading: isSysFormLoading } = useQuery({
    queryKey: ['get_form_config_node_modal', moduleName],
    queryFn: () => getFormConfig(moduleName),
    enabled: Boolean(
      isOpen &&
      node &&
      (isSystemStart || !formConfigId) &&
      moduleName !== 'CUSTOM' &&
      moduleName !== 'CUSTOM_WORKFLOW',
    ),
    select: (res) => res?.data?.data || res || null,
  });

  const { data: customFormDetails, isLoading: isCustomFormLoading } = useQuery({
    queryKey: ['get_custom_form_node_modal', formConfigId],
    queryFn: () => getCustomForm(formConfigId),
    enabled: Boolean(isOpen && node && nodeType === 'FORM' && formConfigId),
    select: (res) => res?.data?.data || res || null,
  });

  const { data: availableCustomForms = [] } = useQuery({
    queryKey: ['get_all_custom_forms_node_modal'],
    queryFn: getAllCustomForms,
    enabled: Boolean(isOpen && node && nodeType === 'FORM'),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['get_all_roles_node_modal'],
    queryFn: getRoles,
    enabled: Boolean(isOpen && node && nodeType === 'APPROVAL'),
    select: (res) => res.data?.data || [],
  });

  return {
    systemFormConfig,
    isSysFormLoading,
    customFormDetails,
    isCustomFormLoading,
    availableCustomForms,
    roles,
  };
}
