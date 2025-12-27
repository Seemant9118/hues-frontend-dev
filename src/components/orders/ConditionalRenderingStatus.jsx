import clsx from 'clsx';
import { useTranslations } from 'next-intl';

const STATUS_UI = {
  SUCCESS: {
    color: '#39C06F',
    bg: '#39C06F1A',
    border: '#39C06F',
  },
  WARNING: {
    color: '#F8BA05',
    bg: '#F8BA051A',
    border: '#F8BA05',
  },
  INFO: {
    color: '#288AF9',
    bg: '#288AF91A',
    border: '#288AF9',
  },
  ERROR: {
    color: '#F16B6B',
    bg: '#F16B6B1A',
    border: '#F16B6B',
  },
  NEUTRAL: {
    color: '#DD9745',
    bg: '#DD97451A',
    border: '#DD9745',
  },
};

const podStatusResolver = ({ status, isSeller, t }) => {
  switch (status) {
    case 'PENDING':
      return {
        text: isSeller ? t('PENDING.pod.podSeller') : t('PENDING.pod.podBuyer'),
        ...STATUS_UI.INFO,
      };

    case 'ACCEPTED':
      return { text: t('ACCEPTED.default'), ...STATUS_UI.SUCCESS };

    case 'REJECTED':
      return { text: t('REJECTED'), ...STATUS_UI.ERROR };

    default:
      return null;
  }
};

const qcStatusResolver = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return {
        text: 'QC Pending',
        ...STATUS_UI.WARNING,
      };

    case 'IN_PROGRESS':
      return {
        text: 'QC ongoing',
        ...STATUS_UI.INFO,
      };

    case 'COMPLETED':
      return {
        text: 'QC Okay',
        ...STATUS_UI.SUCCESS,
      };

    case 'PARTIALLY_COMPLETED':
      return {
        text: 'QC ongoing',
        ...STATUS_UI.INFO,
      };

    case 'PARTIALLY_COMPLETED_WITH_ISSUES':
      return {
        text: 'QC Completed with Issues',
        ...STATUS_UI.ERROR,
      };

    case 'REJECTED':
      return {
        text: 'QC Rejected',
        ...STATUS_UI.ERROR,
      };

    case 'STOCK_IN':
      return {
        text: 'Stocked In',
        ...STATUS_UI.INFO,
      };

    case 'SHORT_QUANTITY':
      return {
        text: 'Short Delivery',
        ...STATUS_UI.WARNING,
      };

    case 'UNSATISFACTORY':
      return {
        text: 'Unsatisfactory Quality',
        ...STATUS_UI.ERROR,
      };

    default:
      return null;
  }
};

const defaultStatusResolver = ({ status, isPayment, isSellerPage, t }) => {
  switch (status) {
    case 'ACCEPTED':
      return {
        text: isPayment ? t('ACCEPTED.isPayment') : t('ACCEPTED.default'),
        ...STATUS_UI.SUCCESS,
      };

    case 'PENDING':
      return {
        text: isPayment
          ? isSellerPage
            ? t('PENDING.isPayment_seller')
            : t('PENDING.isPayment_buyer')
          : t('PENDING.default'),
        ...STATUS_UI.WARNING,
      };

    case 'NEW':
      return { text: t('NEW'), ...STATUS_UI.INFO };

    case 'COMPLETED':
    case 'PAID':
      return { text: t(status), ...STATUS_UI.SUCCESS };

    case 'PARTIAL_PAID':
      return { text: t('PARTIAL_PAID'), ...STATUS_UI.INFO };

    case 'NOT_PAID':
    case 'NOT_RAISED':
    case 'DRAFT':
      return { text: t(status), ...STATUS_UI.WARNING };
    case 'SENT':
      return { text: t(status), ...STATUS_UI.INFO };

    case 'OFFER_SENT':
    case 'OFFER_RECEIVED':
    case 'BID_SENT':
    case 'BID_RECEIVED':
      return { text: t(status), ...STATUS_UI.NEUTRAL };

    case 'NEGOTIATION':
      return { text: t(status), ...STATUS_UI.NEUTRAL };

    case 'INVOICED':
    case 'PARTIAL_INVOICED':
      return { text: t(status), ...STATUS_UI.INFO };

    case 'REJECTED':
    case 'WITHDRAWN':
    case 'STOCK_OUT':
      return { text: t(status), ...STATUS_UI.ERROR };

    case 'STOCK_IN':
      return { text: t(status), ...STATUS_UI.SUCCESS };

    case 'READY_FOR_DISPATCH':
      return { text: t(status), ...STATUS_UI.INFO };
    case 'DEBIT':
      return { text: t(status), ...STATUS_UI.ERROR };
    case 'CREDIT':
      return { text: t(status), ...STATUS_UI.SUCCESS };

    case true:
      return { text: 'Active', ...STATUS_UI.SUCCESS };

    case false:
      return { text: 'Inactive', ...STATUS_UI.ERROR };

    default:
      return null;
  }
};

const resolveStatus = (props) => {
  if (props.isPOD) return podStatusResolver(props);
  if (props.isQC) return qcStatusResolver(props);

  // future flags:
  // if (props.isXYZ) return xyzStatusResolver(props);

  return defaultStatusResolver(props);
};

const ConditionalRenderingStatus = ({
  status,
  isPayment = false,
  isSellerPage = false,
  className,
  isSeller = false,
  isPOD = false,
  isQC = false,
}) => {
  const t = useTranslations('components.conditionalRenderingStatus');

  const resolved = resolveStatus({
    status,
    isPayment,
    isSellerPage,
    isSeller,
    isPOD,
    isQC,
    t,
  });

  if (!resolved) return null;

  const { text, color, bg, border } = resolved;

  return (
    <p
      className={clsx(
        'flex w-fit items-center justify-center rounded border px-1.5 py-1 text-xs font-bold',
        className,
      )}
      style={{
        color,
        backgroundColor: bg,
        borderColor: border,
      }}
    >
      {text}
    </p>
  );
};

export default ConditionalRenderingStatus;
