'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Eye, GitCommit, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import VersionDetails from '@/components/studio/VersionDetails';
import Loading from '@/components/ui/Loading';
import {
  activateFormVersion,
  getFormVersionDetails,
  getFormVersions,
} from '@/services/Form_Config_Services/FormConfigServices';
import {
  activateCustomFormVersion,
  getCustomFormVersionDetails,
  getCustomFormVersions,
} from '@/services/Custom_Form_Services/CustomFormServices';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function FormVersionsTab({
  moduleName,
  formId,
  currentBaseVersion,
  currentRevision,
  isCustom = false,
  onVersionActivated,
}) {
  const targetId = isCustom ? formId || moduleName : moduleName;
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionDetails, setVersionDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activatingVersion, setActivatingVersion] = useState(null);

  // Fetch list of all versions
  const {
    data: versionsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['get_form_versions', targetId, isCustom],
    queryFn: () =>
      isCustom ? getCustomFormVersions(targetId) : getFormVersions(targetId),
    enabled: !!targetId,
  });

  // Ensure versions list is an array and evaluate exact active status
  const versionsList = React.useMemo(() => {
    const list = Array.isArray(versionsData)
      ? versionsData
      : versionsData?.versions || [];

    if (!list || list.length === 0) {
      // Create baseline fallback version if list is empty
      const activeV = currentBaseVersion || 1;
      return [
        {
          version: activeV,
          baseVersion: activeV,
          revision: currentRevision || 0,
          isActive: true,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    return list.map((item) => {
      const vNum = item.version;
      // Strictly respect item.isActive if present; do not force fallback to baseVersion matching
      const isCurActive =
        typeof item.isActive === 'boolean'
          ? item.isActive
          : item.status === 'ACTIVE';

      return {
        ...item,
        version: vNum,
        baseVersion: item.baseVersion || vNum,
        revision: item.revision ?? 0,
        isActive: isCurActive,
        status: isCurActive ? 'ACTIVE' : 'INACTIVE',
      };
    });
  }, [versionsData, currentBaseVersion, currentRevision]);

  // Handle Activate Version
  const handleActivate = async (vNum) => {
    setActivatingVersion(vNum);
    try {
      const res = isCustom
        ? await activateCustomFormVersion(targetId, vNum)
        : await activateFormVersion(targetId, vNum);
      if (res?.status || res?.data) {
        toast.success(
          `Version v${vNum}.0 activated successfully for ${convertSnakeToTitleCase(
            moduleName,
          )}!`,
        );
        refetch();
        if (onVersionActivated) onVersionActivated();
      } else {
        toast.error(res?.message || 'Failed to activate form version.');
      }
    } catch (err) {
      toast.error('An error occurred while activating version.');
    } finally {
      setActivatingVersion(null);
    }
  };

  // Handle Inspect / View Version Details
  const handleInspectVersion = async (vItem) => {
    const vNum = vItem.version;
    setSelectedVersion(vItem);
    setIsLoadingDetails(true);
    try {
      const details = isCustom
        ? await getCustomFormVersionDetails(targetId, vNum)
        : await getFormVersionDetails(targetId, vNum);
      setVersionDetails(details || vItem);
    } catch (err) {
      toast.error(`Failed to load details for version v${vNum}.0`);
      setVersionDetails(vItem);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
            <GitCommit className="h-4 w-4 text-primary" />
            Form Version History & Release Management
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Track schema iterations, inspect field definitions, and activate any
            published version for{' '}
            <strong>{convertSnakeToTitleCase(moduleName)}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Total Versions: {versionsList.length}
          </span>
        </div>
      </div>

      {/* Versions List Table / Cards */}
      <div className="grid gap-4">
        {versionsList.map((vItem) => {
          const vNum = vItem.version || vItem.baseVersion;
          const { isActive } = vItem;

          return (
            <div
              key={vNum}
              className={`flex flex-col justify-between gap-4 rounded-xl border p-5 transition-all sm:flex-row sm:items-center ${
                isActive
                  ? 'border-primary/40 bg-primary/[0.02] shadow-sm'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
              }`}
            >
              {/* Version Metadata */}
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  v{vNum}.0
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-neutral-800">
                      Version {vNum}.0
                    </h4>
                    {isActive ? (
                      <Badge>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                    {vItem.action && (
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                        {vItem.action}
                      </span>
                    )}
                    {vItem.createdAt && (
                      <span>
                        Created:{' '}
                        <strong>
                          {new Date(vItem.createdAt).toLocaleDateString()}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
                <Button
                  variant="outline"
                  onClick={() => handleInspectVersion(vItem)}
                  size="sm"
                >
                  <Eye className="h-3.5 w-3.5 text-neutral-500" />
                  View Details
                </Button>

                {!isActive && (
                  <Button
                    onClick={() => handleActivate(vNum)}
                    disabled={activatingVersion === vNum}
                    size="sm"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {activatingVersion === vNum
                      ? 'Activating...'
                      : 'Make Active'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Version Details Dialog */}
      <VersionDetails
        selectedVersion={selectedVersion}
        versionDetails={versionDetails}
        isLoadingDetails={isLoadingDetails}
        moduleName={moduleName}
        onClose={() => {
          setSelectedVersion(null);
          setVersionDetails(null);
        }}
      />
    </div>
  );
}
