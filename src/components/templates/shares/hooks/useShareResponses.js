import { useInfiniteQuery } from '@tanstack/react-query';
import { getShareResponses } from '@/services/Resource_Share_Services/ResourceShareServices';

export const useShareResponses = (shareId, limit = 10, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ['shareResponses', shareId, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getShareResponses(shareId, pageParam, limit);
      if (response && response.status !== false) {
        return response.data || { data: [], stats: {}, totalPages: 1 };
      }
      throw new Error(response?.message || 'Failed to fetch share responses');
    },
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= (lastPage.totalPages || 1) ? nextPage : undefined;
    },
    enabled: !!shareId && enabled,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};
