import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

// Combines these into a single value (fullPath) to ensure useEffect triggers only when necessary.
const useFullPath = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Combine pathname and search parameters into a single string
  const fullPath = useMemo(() => {
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  return fullPath;
};

// custome hooks
const useMetaData = (title, description) => {
  const fullPath = useFullPath();

  useEffect(() => {
    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [title, description, fullPath]); // Track changes to fullPath
};

export default useMetaData;
