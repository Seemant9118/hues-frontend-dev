/* eslint-disable no-console */

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import Loading from '@/components/ui/Loading';
import Wrapper from '@/components/wrappers/Wrapper';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import SharedLinksListTab from '@/components/templates/shares/components/SharedLinksListTab';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';

import { DragAndDropExtension, getTipTapStyles, VariableNode } from './utils';

import { useTemplateBuilderQueries } from './hooks/useTemplateBuilderQueries';
import { useTemplateBuilderMutations } from './hooks/useTemplateBuilderMutations';

import TemplateBuilderHeader from './components/TemplateBuilderHeader';
import VariableLibrarySidebar from './components/VariableLibrarySidebar';
import TemplateEditorMain from './components/TemplateEditorMain';

export default function TemplateBuilderPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('id');

  const isFeatureEnabled = useFeatureFlag('BUILDER_TEMPLATES');
  const { hasPermission } = usePermission();
  const hasConfigPermission = hasPermission('permission:form-config-manage');

  // Page States
  const [templateName, setTemplateName] = useState('Untitled Template');
  const [isEditingName, setIsEditingName] = useState(false);
  const [status, setStatus] = useState('Draft');
  const [version, setVersion] = useState('v1.0');
  const [lastSavedMsg, setLastSavedMsg] = useState('Unsaved changes');
  const [hasLoadedContent, setHasLoadedContent] = useState(false);

  // Mode: 'editor' | 'preview'
  const [mode, setMode] = useState('editor');

  const initialType = searchParams.get('type') || 'CUSTOM';
  const [templateType, setTemplateType] = useState(initialType);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  const { dynamicVariableLibrary, apiTemplateDetails, isLoadingDetails } =
    useTemplateBuilderQueries({
      templateId,
      isFeatureEnabled,
      hasConfigPermission,
    });

  const {
    createMutation,
    updateMutation,
    unpublishMutation,
    isSaving,
    saveText,
    publishText,
  } = useTemplateBuilderMutations({ templateId });

  // Initialize editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      VariableNode,
      DragAndDropExtension,
      Placeholder.configure({
        placeholder:
          'Write something or click variables from the library to build your template...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose focus:outline-none max-w-none min-h-[450px] p-6 text-neutral-800 bg-white leading-relaxed',
      },
    },
  });

  // Reset hasLoadedContent when templateId changes
  useEffect(() => {
    setHasLoadedContent(false);
  }, [templateId]);

  // Sync API Template Details to editor
  useEffect(() => {
    if (apiTemplateDetails && editor && !hasLoadedContent) {
      setTemplateName(apiTemplateDetails.name || 'Untitled Template');
      setStatus(apiTemplateDetails.isPublished ? 'Published' : 'Draft');
      setTemplateType(apiTemplateDetails.type || 'CUSTOM');
      setVersion(
        typeof apiTemplateDetails.version === 'number'
          ? `v${apiTemplateDetails.version}.0`
          : apiTemplateDetails.version || 'v1.0',
      );
      setLastSavedMsg(
        apiTemplateDetails.updatedAt
          ? `Last updated: ${new Date(apiTemplateDetails.updatedAt).toLocaleDateString()}`
          : 'Loaded from server',
      );

      const contentHtml = apiTemplateDetails.content || '';
      editor.commands.setContent(contentHtml);
      setHasLoadedContent(true);
    }
  }, [apiTemplateDetails, editor, hasLoadedContent]);

  // Save/Publish handlers
  const handleSave = (targetStatus) => {
    if (!editor) return;

    const currentHtml = editor.getHTML();
    const isNew = !templateId;

    // Get enterpriseId from helper function or fallback to 1
    const enterpriseId = Number(getEnterpriseId()) || 1;

    // Send to backend via React Query mutations
    if (isNew) {
      createMutation.mutate({
        name: templateName,
        type: templateType,
        enterpriseId,
        content: currentHtml,
        isPublished: targetStatus === 'Published',
      });
    } else {
      updateMutation.mutate({
        id: templateId,
        data: {
          name: templateName,
          type: templateType,
          content: currentHtml,
        },
        shouldPublish: targetStatus === 'Published',
      });
    }
  };

  if (isLoadingDetails) {
    return (
      <FeatureFlagWrapper flag="BUILDER_TEMPLATES" redirectTo="/dashboard">
        <Wrapper>
          <div className="flex h-[400px] items-center justify-center bg-white">
            <Loading />
          </div>
        </Wrapper>
      </FeatureFlagWrapper>
    );
  }

  return (
    <FeatureFlagWrapper flag="BUILDER_TEMPLATES" redirectTo="/dashboard">
      <Wrapper className="flex h-[calc(100vh-20px)] flex-col overflow-hidden">
        {getTipTapStyles()}

        <Tabs
          defaultValue="builder"
          className="flex h-full flex-col overflow-hidden"
        >
          <TemplateBuilderHeader
            templateId={templateId}
            templateName={templateName}
            setTemplateName={setTemplateName}
            isEditingName={isEditingName}
            setIsEditingName={setIsEditingName}
            status={status}
            version={version}
            templateType={templateType}
            setTemplateType={setTemplateType}
            lastSavedMsg={lastSavedMsg}
            isTypeModalOpen={isTypeModalOpen}
            setIsTypeModalOpen={setIsTypeModalOpen}
            isSaving={isSaving}
            saveText={saveText}
            publishText={publishText}
            handleSave={handleSave}
            unpublishMutation={unpublishMutation}
          />

          {/* Main Layout Area */}
          <TabsContent
            value="builder"
            className="mx-auto mt-2 flex min-h-0 w-full max-w-[1600px] flex-1 gap-4 overflow-hidden outline-none data-[state=inactive]:hidden"
          >
            <VariableLibrarySidebar
              dynamicVariableLibrary={dynamicVariableLibrary}
              editor={editor}
            />

            <TemplateEditorMain
              editor={editor}
              mode={mode}
              setMode={setMode}
              templateName={templateName}
            />
          </TabsContent>

          <TabsContent
            value="share"
            className="mx-auto mt-2 flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden outline-none data-[state=inactive]:hidden"
          >
            <div className="flex h-full flex-col overflow-hidden rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
              {templateId && (
                <SharedLinksListTab
                  resourceType="AGREEMENT"
                  resourceId={templateId}
                  agreement={{
                    id: templateId,
                    name: templateName,
                    type: templateType,
                  }}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Wrapper>
    </FeatureFlagWrapper>
  );
}
