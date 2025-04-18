import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

// Combines these into a single value (fullPath) to ensure useEffect triggers only when necessary.
export const useFullPath = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Combine pathname and search parameters into a single string
  const fullPath = useMemo(() => {
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  return fullPath;
};
