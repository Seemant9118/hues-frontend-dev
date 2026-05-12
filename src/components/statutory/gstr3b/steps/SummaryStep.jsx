import { gstAPIs } from '@/api/gstAPI/gstApi';
import { formattedAmount } from '@/appUtils/helperFunctions';
import InfoBanner from '@/components/auth/InfoBanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  getPortalAutoLiab,
  getSystemSummary,
} from '@/services/GST_Services/GST_Services';
import { useQuery } from '@tanstack/react-query';
import { Calculator, Globe, Monitor, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

const GSTR3BSummaryCard = ({ title, data, variant = 'blue' }) => {
  const headerClass = variant === 'blue' ? 'bg-primary' : 'bg-amber-500';

  return (
    <Card className="flex flex-col overflow-hidden rounded-sm border shadow-sm transition-all hover:shadow-md">
      <div className={`${headerClass} px-3 py-3`}>
        <h4 className="text-[11px] font-bold uppercase leading-tight tracking-tight text-white">
          {title}
        </h4>
      </div>
      <div className="flex-1 bg-white p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {data?.map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-tight text-muted-foreground">
                {item.label}
              </p>
              <p className="text-[13px] font-black text-[#1a1a1a]">
                ₹{item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default function SummaryStep({ formData }) {
  const { period, handleGstError } = formData;

  const retryStrategy = (failureCount, err) => {
    if (err?.response?.data?.error === 'RET11407') {
      return false;
    }
    return failureCount < 3;
  };

  // 1. Fetch System Generated Summary (Left Side)
  const {
    data: systemResponse,
    isLoading: isSystemLoading,
    isError: isSystemError,
    error: systemError,
  } = useQuery({
    queryKey: [gstAPIs.getSystemSummary.endpointKey, period],
    queryFn: () => getSystemSummary(period),
    enabled: !!period,
    retry: retryStrategy,
  });

  // 2. Fetch Portal Auto-Liability (Right Side)
  const {
    data: portalResponse,
    isLoading: isPortalLoading,
    isError: isPortalError,
    error: portalError,
  } = useQuery({
    queryKey: [gstAPIs.getPortalAutoLiab.endpointKey, period],
    queryFn: () => getPortalAutoLiab(period),
    enabled: !!period,
    retry: retryStrategy,
  });

  useEffect(() => {
    // Only trigger toast/modal if not both are failing (to avoid double modals)
    // If both fail, we handle it with a single CTA in the UI
    if (isSystemError && systemError && !isPortalError) {
      handleGstError(systemError);
    }
    if (isPortalError && portalError && !isSystemError) {
      handleGstError(portalError);
    }
  }, [isSystemError, systemError, isPortalError, portalError, handleGstError]);

  const isSessionExpired = (err) => err?.response?.data?.error === 'RET11407';

  const bothSessionExpired =
    isSystemError &&
    isPortalError &&
    isSessionExpired(systemError) &&
    isSessionExpired(portalError);

  const mapPortalData = (response) => {
    const data = response?.data?.data || {};
    const autopop = data.r3bautopop || data || {};
    const liabitc = autopop.liabitc || autopop || {};
    const sup = liabitc.sup_details || {};
    const itc = liabitc.elgitc || {};
    const inwSup = liabitc.inw_sup || {};
    const interest = autopop.inter_latefee || {};

    const sumRows = (objs) => {
      return objs.reduce(
        (acc, obj) => {
          const sub = obj?.subtotal || obj || {};
          acc.txval += Number(sub.txval || 0);
          acc.iamt += Number(sub.iamt || sub.igst || 0);
          acc.camt += Number(sub.camt || sub.cgst || 0);
          acc.samt += Number(sub.samt || sub.sgst || 0);
          acc.csamt += Number(sub.csamt || sub.cess || 0);
          acc.inter_state += Number(sub.inter_state || 0);
          acc.intra_state += Number(sub.intra_state || 0);
          return acc;
        },
        {
          txval: 0,
          iamt: 0,
          camt: 0,
          samt: 0,
          csamt: 0,
          inter_state: 0,
          intra_state: 0,
        },
      );
    };

    const t31Data = sumRows([
      sup.osup_3_1a,
      sup.osup_3_1b,
      sup.osup_3_1c,
      sup.isup_3_1d,
      sup.osup_3_1e,
    ]);
    const t311Data = sumRows([sup.osup_9_5]);
    const t32Data = sumRows([sup.osup_3_2]);
    const t4Data = sumRows([
      itc.itc4a1,
      itc.itc4a2,
      itc.itc4a3,
      itc.itc4a4,
      itc.itc4a5,
    ]);
    const t5Data = sumRows([inwSup]);
    const t51Data = sumRows([interest]);

    const getStandardFormat = (data) => [
      { label: 'Integrated Tax', value: formattedAmount(data.iamt) },
      { label: 'Central Tax', value: formattedAmount(data.camt) },
      { label: 'State/UT Tax', value: formattedAmount(data.samt) },
      { label: 'CESS (₹)', value: formattedAmount(data.csamt) },
    ];

    return {
      t31: getStandardFormat(t31Data),
      t311: getStandardFormat(t311Data),
      t32: [
        { label: 'Taxable Value', value: formattedAmount(t32Data.txval) },
        { label: 'Integrated Tax', value: formattedAmount(t32Data.iamt) },
      ],
      t4: getStandardFormat(t4Data),
      t5: [
        {
          label: 'Inter-state supplies',
          value: formattedAmount(t5Data.inter_state),
        },
        {
          label: 'Intra-state supplies',
          value: formattedAmount(t5Data.intra_state),
        },
      ],
      t51: getStandardFormat(t51Data),
      rawPayable: t31Data.iamt - t4Data.iamt,
    };
  };

  const mapSystemData = (response) => {
    const payload = response?.data?.data?.payload || {};
    const sup = payload.sup_details || {};
    const inter = payload.inter_sup || {};
    const itc = payload.itc_elg || {};

    const sumObjects = (objs) => {
      return objs.reduce(
        (acc, obj) => {
          if (!obj) return acc;
          acc.txval += Number(obj.txval || 0);
          acc.iamt += Number(obj.iamt || 0);
          acc.camt += Number(obj.camt || 0);
          acc.samt += Number(obj.samt || 0);
          acc.csamt += Number(obj.csamt || 0);
          return acc;
        },
        { txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0 },
      );
    };

    const t31Data = sumObjects([
      sup.osup_det,
      sup.osup_zero,
      sup.osup_nil_exmp,
      sup.isup_rev,
      sup.osup_non_gst,
    ]);

    const t32Data = sumObjects([
      ...(inter.comp_details || []),
      ...(inter.unreg_details || []),
      ...(inter.uin_details || []),
    ]);

    const t4Data = sumObjects(itc.itc_avl || []);
    const t4Rev = sumObjects(itc.itc_rev || []);

    // const t5Data = sumObjects([sup.osup_nil_exmp, sup.osup_non_gst]);

    const getStandardFormat = (data) => [
      { label: 'Integrated Tax', value: formattedAmount(data.iamt) },
      { label: 'Central Tax', value: formattedAmount(data.camt) },
      { label: 'State/UT Tax', value: formattedAmount(data.samt) },
      { label: 'CESS (₹)', value: formattedAmount(data.csamt) },
    ];

    return {
      t31: getStandardFormat(t31Data),
      t311: getStandardFormat({ iamt: 0, camt: 0, samt: 0, csamt: 0 }), // Mock if not in payload
      t32: [
        { label: 'Taxable Value', value: formattedAmount(t32Data.txval) },
        { label: 'Integrated Tax', value: formattedAmount(t32Data.iamt) },
      ],
      t4: getStandardFormat({
        iamt: t4Data.iamt - t4Rev.iamt,
        camt: t4Data.camt - t4Rev.camt,
        samt: t4Data.samt - t4Rev.samt,
        csamt: t4Data.csamt - t4Rev.csamt,
      }),
      t5: [
        { label: 'Inter-state supplies', value: '0.00' }, // Map properly if available
        { label: 'Intra-state supplies', value: '0.00' },
      ],
      t51: getStandardFormat({ iamt: 0, camt: 0, samt: 0, csamt: 0 }),
      rawPayable: t31Data.iamt - (t4Data.iamt - t4Rev.iamt),
    };
  };

  const portalMapped = mapPortalData(portalResponse);
  const systemMapped = mapSystemData(systemResponse);

  const renderSide = (title, data, icon, colorClass, label) => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full ${colorClass.bg}`}
        >
          {icon}
        </div>
        <h3
          className={`text-xs font-bold uppercase tracking-widest ${colorClass.text}`}
        >
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
        <GSTR3BSummaryCard
          title="3.1 Tax on outward and reverse charge inward supplies"
          data={data.t31}
        />
        <GSTR3BSummaryCard
          title="3.1.1 Supplies notified under section 9(5)"
          data={data.t311}
        />
        <GSTR3BSummaryCard title="3.2 Inter-state supplies" data={data.t32} />
        <GSTR3BSummaryCard title="4. Eligible ITC" data={data.t4} />
        <GSTR3BSummaryCard
          title="5. Exempt, nil and Non GST inward supplies"
          data={data.t5}
        />
        <GSTR3BSummaryCard
          title="5.1 Interest and Late fee for previous tax period"
          data={data.t51}
        />
      </div>

      <Card className={`border-none ${colorClass.finalBg} p-5 shadow-none`}>
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-[10px] font-bold uppercase tracking-wider ${colorClass.finalText}`}
            >
              Estimated Cash Liability
            </p>
            <p className={`text-[22px] font-black ${colorClass.finalValue}`}>
              {formattedAmount(Math.max(0, data.rawPayable))}
            </p>
          </div>
          <div
            className={`rounded-full ${colorClass.badgeBg} px-3 py-1 text-[10px] font-bold ${colorClass.badgeText}`}
          >
            {label}
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-2">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Calculator className="text-[#2c3e50]" size={24} />
            GSTR-3B Summary Comparison
          </h2>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Verify system aggregations against portal calculated values.
          </p>
        </div>
      </div>

      {bothSessionExpired && (
        <div className="my-4 flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <RefreshCw size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-destructive">
                GST Session Expired
              </p>
              <p className="text-xs text-muted-foreground">
                Both system and portal summaries require re-authentication to
                fetch live data.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleGstError(portalError)}
          >
            Re-authenticate GST Portal
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:divide-x">
        {/* Left Side: System Generated */}
        <div>
          {isSystemLoading ? (
            <div className="flex h-[500px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-slate-50/50">
              <RefreshCw className="animate-spin text-emerald-500" size={32} />
              <p className="text-sm font-medium text-muted-foreground">
                Generating system summary...
              </p>
            </div>
          ) : isSystemError ? (
            <div className="flex h-[500px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-destructive/20 bg-destructive/5 px-8 text-center">
              <p className="text-sm font-bold text-destructive">
                System Summary Failed
              </p>
              <p className="mb-4 text-xs text-muted-foreground">
                {isSessionExpired(systemError)
                  ? 'Session expired. Please use the unified CTA above.'
                  : 'Failed to generate the system summary for this period.'}
              </p>
              {!bothSessionExpired && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGstError(systemError)}
                >
                  {isSessionExpired(systemError)
                    ? 'Re-authenticate'
                    : 'Retry Fetching'}
                </Button>
              )}
            </div>
          ) : (
            renderSide(
              'System Generated',
              systemMapped,
              <Monitor className="text-emerald-600" size={14} />,
              {
                bg: 'bg-emerald-100',
                text: 'text-emerald-800',
                finalBg: 'bg-emerald-50',
                finalText: 'text-emerald-800',
                finalValue: 'text-emerald-900',
                badgeBg: 'bg-emerald-200/50',
                badgeText: 'text-emerald-700',
              },
              'BOOK FIGURES',
            )
          )}
        </div>

        {/* Right Side: Portal Calculated */}
        <div className="lg:pl-12">
          {isPortalLoading ? (
            <div className="flex h-[500px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-slate-50/50">
              <RefreshCw className="animate-spin text-sky-500" size={32} />
              <p className="text-sm font-medium text-muted-foreground">
                Fetching portal summary...
              </p>
            </div>
          ) : isPortalError ? (
            <div className="flex h-[500px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-destructive/20 bg-destructive/5 px-8 text-center">
              <p className="text-sm font-bold text-destructive">
                Portal Summary Unavailable
              </p>
              <p className="mb-4 text-xs text-muted-foreground">
                {isSessionExpired(portalError)
                  ? 'Session expired. Please use the unified CTA above.'
                  : 'Failed to fetch portal summary for this period.'}
              </p>
              {!bothSessionExpired && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGstError(portalError)}
                >
                  {isSessionExpired(portalError)
                    ? 'Re-authenticate'
                    : 'Retry Fetching'}
                </Button>
              )}
            </div>
          ) : (
            renderSide(
              'Portal Auto-Pop',
              portalMapped,
              <Globe className="text-sky-600" size={14} />,
              {
                bg: 'bg-sky-100',
                text: 'text-sky-800',
                finalBg: 'bg-sky-50',
                finalText: 'text-sky-800',
                finalValue: 'text-sky-900',
                badgeBg: 'bg-sky-200/50',
                badgeText: 'text-sky-700',
              },
              'LIVE DATA',
            )
          )}
        </div>
      </div>

      <InfoBanner
        text="Tables shown above represent the high-level summary of your GSTR-3B.
          Discrepancies in the values between System and Portal should be
          investigated before proceeding to payment. Interest and Late fees are
          based on your previous filing history as calculated by the GSTN."
        variant="warning"
        showSupportLink={false}
      />
    </div>
  );
}
