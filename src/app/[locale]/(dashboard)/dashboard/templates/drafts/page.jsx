/* eslint-disable no-console */

'use client';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';

import {
  deleteTemplate,
  getTemplates,
} from '@/services/template-builder/TemplateBuilderServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  Edit,
  FileText,
  LayoutGrid,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import TemplateTypeModal from '@/components/Modals/TemplateTypeModal';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function TemplatesListingPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const enterpriseId = getEnterpriseId();
  const [activeMenu, setActiveMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectType = (type) => {
    setIsModalOpen(false);
    router.push(`/dashboard/template-builder?type=${type}`);
  };

  // Load templates from API using React Query
  const { data: apiTemplates = [], isLoading } = useQuery({
    queryKey: ['get_builder_templates', enterpriseId],
    queryFn: () =>
      getTemplates({ enterpriseId }).then((res) => res.data?.data || []),
    enabled: !!enterpriseId,
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

  if (isLoading) {
    return (
      <FeatureFlagWrapper flag="BUILDER_TEMPLATES" redirectTo="/dashboard">
        <Wrapper>
          <SubHeader name="Drafts" />
          <Loading />
        </Wrapper>
      </FeatureFlagWrapper>
    );
  }

  return (
    <FeatureFlagWrapper flag="BUILDER_TEMPLATES" redirectTo="/dashboard">
      <Wrapper>
        {/* Sub Header */}
        <SubHeader name="Drafts" />

        {/* Page Heading & Filters */}
        <div className="mt-2 flex items-center justify-between border-b border-neutral-100 p-1">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
            <LayoutGrid size={16} />
            <span>Grid View</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Clock size={12} />
            <span>Sorted by last modified</span>
          </div>
        </div>

        {templates.length === 0 ? (
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
            {/* Create New Card */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative flex h-52 flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 p-6 text-center transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/50 group-hover:ring-primary">
                <Plus className="h-6 w-6 text-neutral-500 transition-colors group-hover:text-primary" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-neutral-800 group-hover:text-primary">
                Create a new template
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                Start building a customized agreement from scratch
              </p>
            </button>

            {/* Template Cards */}
            {templates.map((template) => {
              const isDraft = template.status?.toLowerCase() === 'draft';
              return (
                <div
                  key={template.id}
                  onClick={() =>
                    router.push(`/dashboard/template-builder?id=${template.id}`)
                  }
                  className="group relative flex h-52 cursor-pointer flex-col justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition-all duration-300 hover:border-primary hover:shadow-md"
                >
                  {/* Top Action / Title Row */}
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>

                      {/* Context Menu Toggle */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(
                              activeMenu === template.id ? null : template.id,
                            );
                          }}
                          className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeMenu === template.id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(null);
                              }}
                            />
                            <div className="absolute right-0 top-6 z-30 w-36 rounded-lg border border-neutral-100 bg-white p-1 shadow-lg">
                              <button
                                onClick={(e) => handleEdit(template.id, e)}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-50"
                              >
                                <Edit size={12} /> Edit Template
                              </button>
                              <button
                                onClick={(e) => handleDelete(template, e)}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={12} /> Delete Template
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Title & Version */}
                    <div className="mt-3">
                      <h4 className="line-clamp-2 text-sm font-semibold text-neutral-800 group-hover:text-primary">
                        {template.name}
                      </h4>
                      <span className="mt-1 inline-block text-[11px] text-neutral-400">
                        Version {template.version || 'v1.0'}
                      </span>
                    </div>
                  </div>

                  {/* Footer Details */}
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <Clock size={11} />
                      <span className="max-w-[90px] truncate">
                        {template.lastSaved}
                      </span>
                    </div>

                    {/* Status Badges */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isDraft
                          ? 'border border-amber-200 bg-amber-50 text-amber-700'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {isDraft ? (
                        <>
                          <span className="h-1 w-1 animate-pulse rounded-full bg-amber-500" />
                          Draft
                        </>
                      ) : (
                        <>
                          <span className="h-1 w-1 rounded-full bg-emerald-500" />
                          Published
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <TemplateTypeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectType}
          title="Select Template Type"
          description="What type of template do you want to create?"
        />
      </Wrapper>
    </FeatureFlagWrapper>
  );
}
