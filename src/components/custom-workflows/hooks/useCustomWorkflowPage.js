'use client';

import {
  useCustomWorkflowRuntimeDefinition,
  useWorkflowInstancesInfinite,
} from '@/hooks/workflows/useWorkflowRuntime';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export function useCustomWorkflowPage({ definitionId, limit = 10 }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if ?create is present in the URL query string
  const isCreating = searchParams ? searchParams.has('create') : false;

  const [selectedInstance, setSelectedInstance] = useState(null);
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [instances, setInstances] = useState([]);
  const [paginationData, setPaginationData] = useState({
    totalPages: 1,
    currFetchedPage: 1,
  });

  // Reset instances when definitionId changes
  useEffect(() => {
    setInstances([]);
    setPaginationData({ totalPages: 1, currFetchedPage: 1 });
  }, [definitionId]);

  // Fetch full runtime definition
  const {
    data: definition,
    isLoading: isLoadingDefinition,
    refetch: refetchDefinition,
  } = useCustomWorkflowRuntimeDefinition(definitionId);

  // Fetch instances for this custom workflow definition via infinite query
  const {
    data: infiniteData,
    isLoading: isLoadingInstances,
    isFetching,
    fetchNextPage,
    refetch: refetchInstances,
  } = useWorkflowInstancesInfinite(
    {
      module: 'CUSTOM_WORKFLOW',
      definitionId,
      limit,
    },
    {
      enabled: Boolean(definitionId),
    },
  );

  useEffect(() => {
    if (!infiniteData?.pages?.length) return;

    const flattened = infiniteData.pages.flatMap((page) => {
      const pageData = page?.data?.data;
      if (Array.isArray(pageData?.items)) return pageData.items;
      if (Array.isArray(pageData?.data)) return pageData.data;
      if (Array.isArray(pageData)) return pageData;
      return [];
    });

    const uniqueData = Array.from(
      new Map(
        flattened.map((item) => [item.instanceId || item.id, item]),
      ).values(),
    );

    setInstances(uniqueData);

    const lastPageData =
      infiniteData.pages[infiniteData.pages.length - 1]?.data?.data;
    const total = Number(lastPageData?.total ?? 0);
    const limit = Number(lastPageData?.limit ?? 20);
    const totalPages = Math.ceil(total / limit) || 1;
    const currFetchedPage = Number(
      lastPageData?.page ?? infiniteData.pages.length,
    );

    setPaginationData({
      totalPages,
      currFetchedPage,
    });
  }, [infiniteData]);

  const handleStartCreate = useCallback(() => {
    if (definitionId) {
      router.push(`/dashboard/custom-workflows/${definitionId}?create`);
    }
  }, [router, definitionId]);

  const handleCancelCreate = useCallback(() => {
    if (definitionId) {
      router.push(`/dashboard/custom-workflows/${definitionId}`);
    }
  }, [router, definitionId]);

  const handleCreateSuccess = useCallback(() => {
    if (definitionId) {
      router.push(`/dashboard/custom-workflows/${definitionId}`);
    }
    refetchInstances();
  }, [router, definitionId, refetchInstances]);

  const handleInspect = useCallback((inst) => {
    setSelectedInstance(inst);
    setIsInspectOpen(true);
  }, []);

  const handleCloseInspect = useCallback(() => {
    setIsInspectOpen(false);
    setSelectedInstance(null);
  }, []);

  return {
    definition,
    isLoadingDefinition,
    instances,
    paginationData,
    isLoadingInstances,
    isFetching,
    isRefetchingInstances: isFetching,
    fetchNextPage,
    refetchInstances,
    refetchDefinition,
    isCreating,
    handleStartCreate,
    handleCancelCreate,
    handleCreateSuccess,
    selectedInstance,
    isInspectOpen,
    handleInspect,
    handleCloseInspect,
  };
}
