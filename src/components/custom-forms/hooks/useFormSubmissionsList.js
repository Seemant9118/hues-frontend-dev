'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { listFormSubmissions } from '@/services/Form_Submission_Services/FormSubmissionServices';

export const useFormSubmissionsList = ({
  initialFormConfigId = null,
  activeTab,
}) => {
  const [selectedFormId, setSelectedFormId] = useState(
    initialFormConfigId || 'ALL',
  );
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const queryParams = useMemo(() => {
    if (selectedFormId && selectedFormId !== 'ALL') {
      return { formConfigurationId: selectedFormId };
    }
    return {};
  }, [selectedFormId]);

  const {
    data: rawSubmissions = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['list_form_submissions', queryParams],
    queryFn: () => listFormSubmissions(queryParams),
    enabled: activeTab === 'submissions',
  });

  const submissions = useMemo(() => {
    if (!Array.isArray(rawSubmissions)) return [];

    const formatted = rawSubmissions.map((item) => ({
      id: String(item.id),
      formConfigurationId: String(item.formConfigurationId),
      formRevision: item.formRevision ?? 0,
      values: item.values || {},
      status: item.status || 'SUBMITTED',
      submittedBy: item.submittedBy || 'N/A',
      parentType: item.parentType || 'STANDALONE',
      parentModule: item.parentModule || '-',
      parentRecordId: item.parentRecordId || '-',
      createdAt: item.createdAt || item.updatedAt || new Date().toISOString(),
    }));

    return formatted;
  }, [rawSubmissions]);

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailModalOpen(false);
    setSelectedSubmission(null);
  };

  return {
    submissions,
    isLoading,
    isRefetching,
    refetch,
    selectedFormId,
    setSelectedFormId,
    selectedSubmission,
    isDetailModalOpen,
    handleViewDetails,
    handleCloseDetails,
  };
};
