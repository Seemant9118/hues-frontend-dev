/* eslint-disable no-console */

'use client';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import Wrapper from '@/components/wrappers/Wrapper';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { Link } from '@/i18n/routing';
import TemplateTypeModal from '@/components/Modals/TemplateTypeModal';
import {
  createTemplate,
  getTemplateDetails,
  getVariables,
  publishTemplate,
  unpublishTemplate,
  updateTemplate,
} from '@/services/template-builder/TemplateBuilderServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Building2,
  Check,
  ChevronLeft,
  Edit2,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo,
  Save,
  Send,
  Sparkles,
  Undo,
  User,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  DragAndDropExtension,
  getTipTapStyles,
  MOCK_VALUES,
  VariableNode,
} from './utils';

export default function TemplateBuilderPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get('id');

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

  // Fetch pre-registered variables
  const { data: apiVariables = [] } = useQuery({
    queryKey: ['get_builder_variables'],
    queryFn: () => getVariables().then((res) => res.data?.data || []),
  });

  // Categorize variables for Variable Library UI
  const dynamicVariableLibrary = React.useMemo(() => {
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
        return firstLevel;
      }),
    enabled: !!templateId,
  });

  // Mutations for creating
  const createMutation = useMutation({
    mutationFn: (data) => createTemplate(data),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Template created successfully!');
      queryClient.invalidateQueries({ queryKey: ['get_builder_templates'] });
      setTimeout(() => {
        router.push('/dashboard/templates/drafts');
      }, 1500);
    },
    onError: (err) => {
      const errorMsg =
        err?.response?.data?.message || 'Failed to create template.';
      toast.error(errorMsg);
    },
  });

  // Mutations for publish
  const publishMutation = useMutation({
    mutationFn: (id) => publishTemplate(id),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Template published successfully!');
      queryClient.invalidateQueries({ queryKey: ['get_builder_templates'] });
      queryClient.invalidateQueries({
        queryKey: ['get_builder_template', templateId],
      });
      setTimeout(() => {
        router.push('/dashboard/templates/drafts');
      }, 1500);
    },
    onError: (err) => {
      const errorMsg =
        err?.response?.data?.message || 'Failed to publish template.';
      toast.error(errorMsg);
    },
  });

  // Mutation for Unpublish
  const unpublishMutation = useMutation({
    mutationFn: (id) => unpublishTemplate(id),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Template unpublished successfully!');
      queryClient.invalidateQueries({ queryKey: ['get_builder_templates'] });
      queryClient.invalidateQueries({
        queryKey: ['get_builder_template', templateId],
      });
      setTimeout(() => {
        router.push('/dashboard/templates/drafts');
      }, 1500);
    },
    onError: (err) => {
      const errorMsg =
        err?.response?.data?.message || 'Failed to unpublish template.';
      toast.error(errorMsg);
    },
  });

  // Mutation for updating templates
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTemplate(id, data),
    onSuccess: (res, variables) => {
      toast.success(res.data?.message || 'Template updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['get_builder_templates'] });
      queryClient.invalidateQueries({
        queryKey: ['get_builder_template', templateId],
      });

      if (variables.shouldPublish) {
        publishMutation.mutate(variables.id);
      } else {
        setTimeout(() => {
          router.push('/dashboard/templates/drafts');
        }, 1500);
      }
    },
    onError: (err) => {
      const errorMsg =
        err?.response?.data?.message || 'Failed to update template.';
      toast.error(errorMsg);
    },
  });

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    publishMutation.isPending ||
    unpublishMutation.isPending;

  const saveText =
    createMutation.isPending ||
    (updateMutation.isPending && !updateMutation.variables?.shouldPublish)
      ? 'Saving...'
      : 'Save';

  const publishText =
    publishMutation.isPending ||
    createMutation.isPending ||
    (updateMutation.isPending && updateMutation.variables?.shouldPublish)
      ? 'Publishing...'
      : 'Publish';

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

  // Variable insertion
  const handleInsertVariable = (variable) => {
    if (editor) {
      editor.commands.insertContent({
        type: 'variable',
        attrs: {
          label: variable.label,
          id: variable.id,
        },
      });
      editor.commands.focus();
    }
  };

  const handleDragStart = (e, variable) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'variable',
        label: variable.label,
        id: variable.id,
      }),
    );
  };

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

  // Helper to compile final content layout for preview resolving variables
  const getResolvedContentHtml = (html) => {
    if (typeof window === 'undefined') return html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const variables = doc.querySelectorAll('span[data-variable]');

    variables.forEach((el) => {
      const rawLabel = el.getAttribute('label') || el.textContent || '';
      const label = rawLabel.replace(/[{}]/g, '').trim();
      const resolvedValue = MOCK_VALUES[label] || label;

      const replacement = doc.createElement('span');
      replacement.className =
        'inline-block bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 mx-0.5 rounded text-xs border border-emerald-200 select-none';
      replacement.textContent = resolvedValue;
      el.replaceWith(replacement);
    });

    return doc.body.innerHTML;
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

        {/* Header bar */}
        <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/templates/drafts"
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && setIsEditingName(false)
                      }
                      className="rounded-md border border-blue-400 px-2 py-0.5 text-base font-bold text-neutral-800 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="group flex items-center gap-2">
                    <h1 className="text-lg font-bold text-neutral-800">
                      {templateName}
                    </h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="rounded p-1 text-neutral-400 opacity-0 transition-all hover:bg-neutral-100 hover:text-neutral-700 group-hover:opacity-100"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
                <span
                  className={`py-0.2 rounded border px-1.5 text-[10px] font-semibold uppercase ${
                    status.toLowerCase() === 'draft'
                      ? 'border-amber-200 bg-amber-50 text-amber-600'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {status}
                </span>
                <span>•</span>
                <span>{version}</span>
                <span>•</span>
                <button
                  onClick={() => setIsTypeModalOpen(true)}
                  className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-600 transition hover:bg-blue-100"
                  title="Click to change template type"
                >
                  {templateType}
                </button>
                <span>•</span>
                <span>Last saved: {lastSavedMsg}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave('Draft')}
              disabled={isSaving}
            >
              <Save size={14} className="mr-1.5" /> {saveText}
            </Button>
            {status === 'Published' ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => unpublishMutation.mutate(templateId)}
                disabled={isSaving}
              >
                <EyeOff size={14} className="mr-1.5" />{' '}
                {unpublishMutation.isPending ? 'Unpublishing...' : 'Unpublish'}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleSave('Published')}
                disabled={isSaving}
              >
                <Send size={14} className="mr-1.5" /> {publishText}
              </Button>
            )}
          </div>
        </header>

        {/* Main Layout Area */}
        <div className="mx-auto mt-2 flex min-h-0 w-full max-w-[1600px] flex-1 gap-4 overflow-hidden">
          {/* Left Pane: Variable Library (~20% width) */}
          <aside className="flex h-full w-1/5 shrink-0 flex-col gap-4 overflow-hidden">
            <div className="flex h-full flex-col overflow-hidden rounded-sm border border-neutral-200 bg-white p-3 shadow-sm">
              <div className="shrink-0 border-b border-neutral-100 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Variable Library
                </h2>
                <p className="mt-1 text-[10px] text-neutral-400">
                  Click a variable to insert, or drag & drop it in place.
                </p>
              </div>

              <div className="scrollBarStyles mt-4 flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
                {dynamicVariableLibrary.map((group) => (
                  <div key={group.category} className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700">
                      {group.icon}
                      <span>{group.category}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((v) => (
                        <div
                          key={v.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, v)}
                          onClick={() => handleInsertVariable(v)}
                          className="flex cursor-grab select-none items-center rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-100 active:cursor-grabbing"
                          title={
                            v.description ||
                            'Drag into editor or click to insert at cursor'
                          }
                        >
                          {`{{${v.label}}}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Pane: Editor / Preview Area (Takes remaining width) */}
          <main className="flex h-full flex-1 flex-col gap-4 overflow-hidden">
            <div className="flex h-full flex-col overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-sm">
              {/* Toolbar Area */}
              <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-neutral-50/50 px-4 py-2.5">
                {/* Editor controls - only visible in 'editor' mode */}
                <div className="flex items-center gap-1">
                  {mode === 'editor' && editor ? (
                    <>
                      <button
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                        }
                        className={`rounded p-1.5 text-neutral-600 hover:bg-neutral-200 ${
                          editor.isActive('heading', { level: 1 })
                            ? 'bg-neutral-200 font-bold text-neutral-900'
                            : ''
                        }`}
                        title="Heading 1"
                      >
                        <Heading1 size={15} />
                      </button>
                      <button
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                        }
                        className={`rounded p-1.5 text-neutral-600 hover:bg-neutral-200 ${
                          editor.isActive('heading', { level: 2 })
                            ? 'bg-neutral-200 font-bold text-neutral-900'
                            : ''
                        }`}
                        title="Heading 2"
                      >
                        <Heading2 size={15} />
                      </button>
                      <div className="mx-1 h-4 w-[1px] bg-neutral-200" />
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleBold().run()
                        }
                        className={`rounded p-1.5 text-neutral-600 hover:bg-neutral-200 ${
                          editor.isActive('bold')
                            ? 'bg-neutral-200 font-bold text-neutral-900'
                            : ''
                        }`}
                        title="Bold"
                      >
                        <Bold size={15} />
                      </button>
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleItalic().run()
                        }
                        className={`rounded p-1.5 text-neutral-600 hover:bg-neutral-200 ${
                          editor.isActive('italic')
                            ? 'bg-neutral-200 font-bold text-neutral-900'
                            : ''
                        }`}
                        title="Italic"
                      >
                        <Italic size={15} />
                      </button>
                      <div className="mx-1 h-4 w-[1px] bg-neutral-200" />
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleBulletList().run()
                        }
                        className={`rounded p-1.5 text-neutral-600 hover:bg-neutral-200 ${
                          editor.isActive('bulletList')
                            ? 'bg-neutral-200 text-neutral-900'
                            : ''
                        }`}
                        title="Bullet List"
                      >
                        <List size={15} />
                      </button>
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleOrderedList().run()
                        }
                        className={`rounded p-1.5 text-neutral-600 hover:bg-neutral-200 ${
                          editor.isActive('orderedList')
                            ? 'bg-neutral-200 text-neutral-900'
                            : ''
                        }`}
                        title="Numbered List"
                      >
                        <ListOrdered size={15} />
                      </button>
                      <div className="mx-1 h-4 w-[1px] bg-neutral-200" />
                      <button
                        onClick={() => editor.chain().focus().undo().run()}
                        className="rounded p-1.5 text-neutral-600 hover:bg-neutral-200"
                        title="Undo"
                      >
                        <Undo size={15} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().redo().run()}
                        className="rounded p-1.5 text-neutral-600 hover:bg-neutral-200"
                        title="Redo"
                      >
                        <Redo size={15} />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                      <Eye size={14} className="text-emerald-500" />
                      <span>
                        Preview Document Mode (Variables resolved with mock
                        data)
                      </span>
                    </div>
                  )}
                </div>

                {/* Mode Toggle Buttons */}
                <div className="flex items-center rounded-lg bg-neutral-200/60 p-0.5 text-xs font-semibold">
                  <button
                    onClick={() => setMode('editor')}
                    className={`rounded-md px-3 py-1 transition-all ${
                      mode === 'editor'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => setMode('preview')}
                    className={`rounded-md px-3 py-1 transition-all ${
                      mode === 'preview'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* Editing / Preview Content Area */}
              <div className="scrollBarStyles flex-1 overflow-y-auto bg-white">
                {mode === 'editor' ? (
                  <div className="h-full">
                    <EditorContent editor={editor} />
                  </div>
                ) : (
                  <div className="prose max-w-none p-8 text-neutral-800">
                    <h1 className="mb-6 border-b pb-2 text-2xl font-bold">
                      {templateName}
                    </h1>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getResolvedContentHtml(
                          editor ? editor.getHTML() : '',
                        ),
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Bottom Editor Tip */}
              {mode === 'editor' && (
                <div className="flex shrink-0 items-center justify-between border-t border-neutral-100 bg-neutral-50 px-6 py-2.5 text-[11px] text-neutral-400">
                  <span>
                    Tip: Click or Drag and Drop variables from the library on
                    the left directly into the text editor.
                  </span>
                  <span className="flex items-center gap-1 font-medium text-blue-500">
                    <Sparkles size={11} /> Rich Template Builder
                  </span>
                </div>
              )}
            </div>
          </main>
        </div>
        <TemplateTypeModal
          isOpen={isTypeModalOpen}
          onClose={() => setIsTypeModalOpen(false)}
          onSelect={(type) => {
            setTemplateType(type);
            setIsTypeModalOpen(false);
            toast.success(`Template type changed to ${type}`);
          }}
          selectedType={templateType}
          title="Change Template Type"
          description="Select a new type for this template"
        />
      </Wrapper>
    </FeatureFlagWrapper>
  );
}
