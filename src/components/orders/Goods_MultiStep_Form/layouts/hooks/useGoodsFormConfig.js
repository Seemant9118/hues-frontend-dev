import { getFormConfig } from '@/services/Form_Config_Services/FormConfigServices';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook to manage form configuration fetching, versions, and custom/system fields.
 */
export const useGoodsFormConfig = ({ cta, isOffer, setOrder }) => {
  const [fields, setFields] = useState([]);
  const [baseVersion, setBaseVersion] = useState(1);
  const [revision, setRevision] = useState(0);
  const [etag, setEtag] = useState('');
  const [originalCustomFields, setOriginalCustomFields] = useState([]);
  const [originalSystemFields, setOriginalSystemFields] = useState([]);

  const handleSetFields = (newFields) => {
    setFields((prev) => {
      const updatedFields =
        typeof newFields === 'function' ? newFields(prev) : newFields;
      setOrder((prevOrder) => ({ ...prevOrder, _formFields: updatedFields }));
      return updatedFields;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      const moduleName = isOffer ? 'SALES_ORDER' : 'PURCHASE_ORDER';
      try {
        const config = await getFormConfig(moduleName);
        if (isMounted && config) {
          setFields(config.fields || []);
          setBaseVersion(config.baseVersion || 1);
          setRevision(config.revision || 0);
          setEtag(config.etag || '');
          setOriginalCustomFields(
            config.originalCustomFields ||
              (config.fields || []).filter((f) => f.kind === 'CUSTOM'),
          );
          setOriginalSystemFields(
            config.originalSystemFields ||
              JSON.parse(
                JSON.stringify(
                  (config.fields || []).filter((f) => f.kind === 'SYSTEM'),
                ),
              ),
          );
          setOrder((prev) => ({ ...prev, _formFields: config.fields }));
        }
      } catch (error) {
        toast.error('Error fetching form config:', error);
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, [cta, isOffer, setOrder]);

  const handleSaveSuccess = (updatedConfig, isFallback) => {
    setFields(updatedConfig.fields || []);
    setOrder((prev) => ({ ...prev, _formFields: updatedConfig.fields }));

    if (!isFallback) {
      setBaseVersion(updatedConfig.baseVersion || 1);
      setRevision(updatedConfig.revision || 0);
      setEtag(updatedConfig.etag || '');
      setOriginalCustomFields(
        (updatedConfig.fields || []).filter((f) => f.kind === 'CUSTOM'),
      );
      setOriginalSystemFields(
        JSON.parse(
          JSON.stringify(
            (updatedConfig.fields || []).filter((f) => f.kind === 'SYSTEM'),
          ),
        ),
      );
    }
  };

  return {
    fields,
    setFields,
    handleSetFields,
    baseVersion,
    revision,
    etag,
    originalCustomFields,
    originalSystemFields,
    handleSaveSuccess,
  };
};
