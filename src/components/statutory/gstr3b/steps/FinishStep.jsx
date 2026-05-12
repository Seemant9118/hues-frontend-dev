import { gstAPIs } from '@/api/gstAPI/gstApi';
import { Button } from '@/components/ui/button';
import {
  fileGSTR3B,
  getGSTR3BReturnSummary,
} from '@/services/GST_Services/GST_Services';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronRight,
  Code2,
  FileCheck,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function FinishStep({ formData }) {
  const { period, handleGstError } = formData;

  const retryStrategy = (failureCount, err) => {
    if (err?.response?.data?.error === 'RET11407') {
      return false;
    }
    return failureCount < 3;
  };

  // 1. Fetch Return Summary
  const {
    data: summaryResponse,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch,
  } = useQuery({
    queryKey: [gstAPIs.getGSTR3BReturnSummary.endpointKey, period],
    queryFn: () => getGSTR3BReturnSummary(period),
    enabled: !!period,
    retry: retryStrategy,
  });

  // 2. File Now Mutation
  const { mutate: handleFileNow, isLoading: isFiling } = useMutation({
    mutationFn: () => fileGSTR3B(period),
    onSuccess: (res) => {
      if (res?.data?.success) {
        toast.success('GSTR-3B filed successfully!');
      } else {
        toast.error(res?.data?.message || 'Filing failed');
      }
    },
    onError: (err) => {
      const isExpired = err?.response?.data?.error === 'RET11407';
      if (isExpired) {
        handleGstError(err);
      } else {
        toast.error(
          err?.response?.data?.message || 'Something went wrong during filing',
        );
      }
    },
  });

  const isSessionExpired = summaryError?.response?.data?.error === 'RET11407';

  const payload = summaryResponse?.data?.data || summaryResponse?.data || {};

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-10">
      {/* Left Side (60%): JSON Payload Viewer */}
      <div className="lg:col-span-6">
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0d1117] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#161b22] px-4 py-3">
            <div className="flex items-center gap-2">
              <Code2 className="text-sky-400" size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                GSTR-3B Final Payload (Preview)
              </span>
            </div>
            {isSummaryLoading && (
              <Loader2 className="animate-spin text-slate-500" size={14} />
            )}
          </div>

          <div className="custom-scrollbar relative flex-1 overflow-auto p-6 font-mono text-[12px] leading-relaxed text-emerald-400/90">
            {isSummaryLoading ? (
              <div className="flex h-full items-center justify-center space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw
                    className="animate-spin text-slate-600"
                    size={32}
                  />
                  <p className="text-slate-500">Preparing return summary...</p>
                </div>
              </div>
            ) : isSummaryError ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <p className="mb-2 font-sans text-sm font-bold text-red-400">
                  {isSessionExpired
                    ? 'GST Session Expired'
                    : 'Failed to load summary'}
                </p>
                <p className="mb-6 font-sans text-xs text-slate-500">
                  {isSessionExpired
                    ? 'Your session with the GST portal has expired. Please re-authenticate to view the final payload.'
                    : 'An error occurred while fetching the return data from the system.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={() =>
                    isSessionExpired ? handleGstError(summaryError) : refetch()
                  }
                >
                  {isSessionExpired ? 'Re-authenticate' : 'Retry'}
                </Button>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap selection:bg-sky-500/30">
                {JSON.stringify(payload, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Right Side (40%): Actions */}
      <div className="lg:col-span-4">
        <div className="flex flex-col space-y-6 lg:pl-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Ready for Filing
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              GSTR-3B Prepared
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your return has been successfully validated against system and
              portal data. You can now save a draft or proceed with the final
              submission to the GST portal.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            {/* <Button
              variant="outline"
              className="flex h-14 items-center justify-between px-6 text-sm font-bold transition-all hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2">
                  <Save className="text-slate-600" size={18} />
                </div>
                <span>Save as Draft</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </Button> */}

            <Button
              disabled={isFiling || isSummaryLoading || isSummaryError}
              onClick={() => handleFileNow()}
              className="group relative flex h-14 items-center justify-between overflow-hidden bg-sky-600 px-6 text-sm font-bold text-white transition-all hover:bg-sky-700"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2 transition-colors group-hover:bg-white/30">
                  {isFiling ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <FileCheck size={18} />
                  )}
                </div>
                <span>{isFiling ? 'Filing in progress...' : 'File Now'}</span>
              </div>
              <ChevronRight
                size={16}
                className="opacity-50 transition-transform group-hover:translate-x-1"
              />
            </Button>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
            <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Important Notice
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-700/80">
              By clicking &apos;File Now&lsquo;, you are authorizing the system
              to submit this return to the GSTN portal using your EVC/DSC
              credentials. Ensure all values have been reconciled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
