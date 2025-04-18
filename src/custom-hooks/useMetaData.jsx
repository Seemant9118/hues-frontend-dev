import { useEffect } from 'react';
import { useFullPath } from './useFullPath';

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
