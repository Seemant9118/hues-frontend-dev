import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  createTemplate,
  publishTemplate,
  unpublishTemplate,
  updateTemplate,
} from '@/services/template-builder/TemplateBuilderServices';

export function useTemplateBuilderMutations({ templateId }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Mutation for creating
  const createMutation = useMutation({
    mutationFn: (data) => createTemplate(data),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Template created successfully!');
      queryClient.invalidateQueries({ queryKey: ['get_builder_templates'] });
      setTimeout(() => {
        router.push('/dashboard/templates/agreements');
      }, 1500);
    },
    onError: (err) => {
      const errorMsg =
        err?.response?.data?.message || 'Failed to create template.';
      toast.error(errorMsg);
    },
  });

  // Mutation for publishing
  const publishMutation = useMutation({
    mutationFn: (id) => publishTemplate(id),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Template published successfully!');
      queryClient.invalidateQueries({ queryKey: ['get_builder_templates'] });
      queryClient.invalidateQueries({
        queryKey: ['get_builder_template', templateId],
      });
      setTimeout(() => {
        router.push('/dashboard/templates/agreements');
      }, 1500);
    },
    onError: (err) => {
      const errorMsg =
        err?.response?.data?.message || 'Failed to publish template.';
      toast.error(errorMsg);
    },
  });

  // Mutation for Unpublishing
  const unpublishMutation = useMutation({
    mutationFn: (id) => unpublishTemplate(id),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Template unpublished successfully!');
      queryClient.invalidateQueries({ queryKey: ['get_builder_templates'] });
      queryClient.invalidateQueries({
        queryKey: ['get_builder_template', templateId],
      });
      setTimeout(() => {
        router.push('/dashboard/templates/agreements');
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
          router.push('/dashboard/templates/agreements');
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

  return {
    createMutation,
    updateMutation,
    publishMutation,
    unpublishMutation,
    isSaving,
    saveText,
    publishText,
  };
}
