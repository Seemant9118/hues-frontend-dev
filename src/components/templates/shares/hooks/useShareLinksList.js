import { useQuery } from '@tanstack/react-query';
import { listResourceShares } from '@/services/Resource_Share_Services/ResourceShareServices';

export const useShareLinksList = (
  resourceType,
  resourceId,
  page = 1,
  limit = 10,
) => {
  return useQuery({
    queryKey: ['shareLinks', resourceType, resourceId, page, limit],
    queryFn: async () => {
      const response = await listResourceShares(
        resourceType,
        resourceId,
        page,
        limit,
      );
      if (response && response.status !== false) {
        return response.data || { items: [], count: 0 };
      }
      throw new Error(response?.message || 'Failed to fetch shares');
    },
    enabled: !!resourceType && !!resourceId,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};
