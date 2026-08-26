'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import StudioWorkflowOverviewPane, {
  mapStudioModuleToWorkflowModule,
} from '@/components/studio/StudioWorkflowOverviewPane';
import SubHeader from '@/components/ui/Sub-header';
import Loading from '@/components/ui/Loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';
import { useWorkflowDefinitions } from '@/hooks/workflows/useWorkflowBuilder';
import { getCustomForm } from '@/services/Custom_Form_Services/CustomFormServices';
import { getFormConfig } from '@/services/Form_Config_Services/FormConfigServices';
import BuildNewWorkflowModal from './components/BuildNewWorkflowModal';
import StudioActionHeaderControls from './components/StudioActionHeaderControls';

export default function StudioDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params?.id;

  const isFeatureEnabled = useFeatureFlag('BUILDER_STUDIO');
  const { hasPermission } = usePermission();
  const hasConfigPermission = hasPermission('permission:form-config-manage');

  const [activeTab, setActiveTab] = useState('overview');

  // Workflow Overview Header Control States
  const [selectedDefinitionId, setSelectedDefinitionId] = useState(null);
  const [hasUserManuallySelected, setHasUserManuallySelected] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreatingNewFlow, setIsCreatingNewFlow] = useState(false);

  // Build New Workflow Modal State
  const [isNewWorkflowModalOpen, setIsNewWorkflowModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  const searchParams = useSearchParams();
  const formType = searchParams.get('type');
  const isCustomForm = formType === 'CUSTOM';

  // Load form configuration for specific module
  const { data: config, isLoading } = useQuery({
    queryKey: ['get_form_config', moduleId, isCustomForm],
    queryFn: async () => {
      if (isCustomForm) {
        const customData = await getCustomForm(moduleId);
        if (customData) {
          return {
            ...customData,
            id: customData.id || moduleId,
            module: customData.name,
            isCustom: true,
          };
        }
        return {
          id: moduleId,
          module: moduleId,
          isCustom: true,
        };
      }
      return getFormConfig(moduleId);
    },
    enabled: isFeatureEnabled && hasConfigPermission && !!moduleId,
  });

  const targetModule = mapStudioModuleToWorkflowModule(
    config?.module || moduleId,
  );
  const { data: definitions = [], isLoading: isDefinitionsLoading } =
    useWorkflowDefinitions(targetModule);

  // Combine definitions with local temporary draft entry when creating new workflow
  const combinedDefinitions = useMemo(() => {
    if (isCreatingNewFlow && newWorkflowName) {
      const localTempDef = {
        id: 'LOCAL_TEMP_DRAFT',
        name: `${newWorkflowName} (New Draft)`,
        status: 'DRAFT',
        active: false,
        isLocalTemp: true,
      };
      return [localTempDef, ...definitions];
    }
    return definitions;
  }, [definitions, isCreatingNewFlow, newWorkflowName]);

  // Auto-select ACTIVE workflow definition by default on initial load
  useEffect(() => {
    if (isCreatingNewFlow) {
      setSelectedDefinitionId('LOCAL_TEMP_DRAFT');
      return;
    }
    if (definitions.length > 0 && !hasUserManuallySelected) {
      const activeDef =
        definitions.find(
          (d) =>
            d.active === true ||
            String(d.status || '').toUpperCase() === 'ACTIVE' ||
            String(d.status || '').toUpperCase() === 'PUBLISHED',
        ) || definitions[0];

      if (activeDef) {
        setSelectedDefinitionId(activeDef.id);
      }
    }
  }, [definitions, isCreatingNewFlow, hasUserManuallySelected]);

  // Open Build New Workflow Modal
  const handleOpenNewWorkflowModal = () => {
    setNewWorkflowName('');
    setIsNewWorkflowModalOpen(true);
  };

  // Submit Build New Workflow Modal
  const handleCreateWorkflowSubmit = (e) => {
    e?.preventDefault();
    if (!newWorkflowName.trim()) {
      toast.error('Please enter a name for the new workflow.');
      return;
    }
    setIsCreatingNewFlow(true);
    setSelectedDefinitionId('LOCAL_TEMP_DRAFT');
    setIsEditMode(true);
    setIsNewWorkflowModalOpen(false);
    toast.success(
      `Started building new workflow "${newWorkflowName}" for ${targetModule}.`,
    );
  };

  // Cancel Building New Workflow Handler
  const handleCancelNewWorkflow = () => {
    setIsCreatingNewFlow(false);
    setNewWorkflowName('');
    setHasUserManuallySelected(false);
    const activeDef =
      definitions.find(
        (d) =>
          d.active === true ||
          String(d.status || '').toUpperCase() === 'ACTIVE' ||
          String(d.status || '').toUpperCase() === 'PUBLISHED',
      ) || definitions[0];

    if (activeDef) {
      setSelectedDefinitionId(activeDef.id);
    }
    toast.info('Cancelled building new workflow.');
  };

  if (isLoading) {
    return (
      <FeatureFlagWrapper flag="BUILDER_STUDIO" redirectTo="/dashboard">
        <ProtectedWrapper
          permissionCode="permission:form-config-manage"
          redirectTo="/dashboard"
        >
          <Wrapper>
            <SubHeader name="Studio(Workflow) Details" />
            <Loading />
          </Wrapper>
        </ProtectedWrapper>
      </FeatureFlagWrapper>
    );
  }

  const titleName = convertSnakeToTitleCase(
    config?.module || 'Studio (Workflow)',
  );

  return (
    <FeatureFlagWrapper flag="BUILDER_STUDIO" redirectTo="/dashboard">
      <ProtectedWrapper
        permissionCode="permission:form-config-manage"
        redirectTo="/dashboard"
      >
        <Wrapper>
          {/* Header & Back Action */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard/studio')}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-100"
                title="Back to Studio"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <SubHeader name={`${titleName}`} />
                <p className="text-xs text-neutral-500">
                  Design and manage automated approval and action workflows.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <section className="mb-4 flex w-full flex-wrap items-center justify-between gap-2">
              <TabsList className="border border-neutral-200 bg-neutral-50 p-1">
                <TabsTrigger value="overview">Workflow</TabsTrigger>
              </TabsList>

              {/* Action Header Controls */}
              {activeTab === 'overview' && (
                <StudioActionHeaderControls
                  selectedDefinitionId={selectedDefinitionId}
                  onSelectDefinition={(val) => {
                    if (val === 'LOCAL_TEMP_DRAFT') return;
                    setHasUserManuallySelected(true);
                    setIsCreatingNewFlow(false);
                    setSelectedDefinitionId(val);
                  }}
                  isDefinitionsLoading={isDefinitionsLoading}
                  definitions={combinedDefinitions}
                  onOpenNewWorkflowModal={handleOpenNewWorkflowModal}
                  isEditMode={isEditMode}
                  setIsEditMode={setIsEditMode}
                />
              )}
            </section>

            {/* Tab 0: Overview */}
            <TabsContent value="overview" className="space-y-4">
              <StudioWorkflowOverviewPane
                moduleName={config?.module || moduleId}
                selectedDefinitionId={selectedDefinitionId}
                setSelectedDefinitionId={setSelectedDefinitionId}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                isCreatingNewFlow={isCreatingNewFlow}
                setIsCreatingNewFlow={setIsCreatingNewFlow}
                newWorkflowName={newWorkflowName}
                onCancelNewWorkflow={handleCancelNewWorkflow}
              />
            </TabsContent>
          </Tabs>

          {/* Build New Workflow Modal */}
          <BuildNewWorkflowModal
            isOpen={isNewWorkflowModalOpen}
            onOpenChange={setIsNewWorkflowModalOpen}
            newWorkflowName={newWorkflowName}
            setNewWorkflowName={setNewWorkflowName}
            targetModule={targetModule}
            onSubmit={handleCreateWorkflowSubmit}
          />
        </Wrapper>
      </ProtectedWrapper>
    </FeatureFlagWrapper>
  );
}
