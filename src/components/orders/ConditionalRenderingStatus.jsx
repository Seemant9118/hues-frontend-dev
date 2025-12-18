import clsx from 'clsx';
import { useTranslations } from 'next-intl';

const ConditionalRenderingStatus = ({
  status,
  isPayment = false,
  isSellerPage = false,
  className,
  isSeller = false,
  isPOD = false,
}) => {
  const translations = useTranslations('components.conditionalRenderingStatus');

  let statusText;
  let statusColor;
  let statusBG;
  let statusBorder;

  /* ===================== POD STATUS ===================== */
  if (isPOD) {
    switch (status) {
      case 'PENDING':
        statusText = isSeller
          ? translations('PENDING.pod.podSeller')
          : translations('PENDING.pod.podBuyer');
        statusColor = '#288AF9';
        statusBG = '#288AF91A';
        statusBorder = '#288AF9';
        break;

      case 'ACCEPTED':
        statusText = translations('ACCEPTED.default');
        statusColor = '#39C06F';
        statusBG = '#39C06F1A';
        statusBorder = '#39C06F';
        break;

      case 'REJECTED':
        statusText = translations('REJECTED');
        statusColor = '#F16B6B';
        statusBG = '#F16B6B1A';
        statusBorder = '#F16B6B';
        break;

      default:
        return null;
    }
  } else {
    /* ===================== GENERAL STATUS ===================== */
    switch (status) {
      case 'ACCEPTED':
        statusText = isPayment
          ? translations('ACCEPTED.isPayment')
          : translations('ACCEPTED.default');
        statusColor = '#39C06F';
        statusBG = '#39C06F1A';
        statusBorder = '#39C06F';
        break;

      case 'PENDING':
        statusText = isPayment
          ? isSellerPage
            ? translations('PENDING.isPayment_seller')
            : translations('PENDING.isPayment_buyer')
          : translations('PENDING.default');
        statusColor = '#F8BA05';
        statusBG = '#F8BA051A';
        statusBorder = '#F8BA05';
        break;

      case 'NEW':
        statusText = translations('NEW');
        statusColor = '#288AF9';
        statusBG = '#288AF91A';
        statusBorder = '#288AF9';
        break;

      case 'COMPLETED':
        statusText = translations('COMPLETED');
        statusColor = '#39C06F';
        statusBG = '#39C06F1A';
        statusBorder = '#39C06F';
        break;

      case 'OFFER_SENT':
      case 'OFFER_RECEIVED':
      case 'BID_SENT':
      case 'BID_RECEIVED':
        statusText = translations(status);
        statusColor = '#DD9745';
        statusBG = '#DD97451A';
        statusBorder = '#DD9745';
        break;

      case 'NEGOTIATION':
        statusText = translations('NEGOTIATION');
        statusColor = '#F8BA05';
        statusBG = '#F8BA051A';
        statusBorder = '#F8BA05';
        break;

      case 'INVOICED':
      case 'PARTIAL_INVOICED':
        statusText = translations(status);
        statusColor = '#6EAFFC';
        statusBG = '#6EAFFC1A';
        statusBorder = '#6EAFFC';
        break;

      case 'WITHDRAWN':
      case 'REJECTED':
        statusText = translations(status);
        statusColor = '#F16B6B';
        statusBG = '#F16B6B1A';
        statusBorder = '#F16B6B';
        break;

      /* ================= PAYMENT STATUS ================= */
      case 'PAID':
        statusText = translations('PAID');
        statusColor = '#39C06F';
        statusBG = '#39C06F1A';
        statusBorder = '#39C06F';
        break;

      case 'PARTIAL_PAID':
        statusText = translations('PARTIAL_PAID');
        statusColor = '#288AF9';
        statusBG = '#288AF91A';
        statusBorder = '#288AF9';
        break;

      case 'NOT_PAID':
        statusText = translations('NOT_PAID');
        statusColor = '#F8BA05';
        statusBG = '#F8BA051A';
        statusBorder = '#F8BA05';
        break;

      /* ================= DEBIT / CREDIT NOTE ================= */
      case 'NOT_RAISED':
        statusText = translations('NOT_RAISED');
        statusColor = '#F8BA05';
        statusBG = '#F8BA051A';
        statusBorder = '#F8BA05';
        break;

      case 'RAISED':
        statusText = translations('RAISED');
        statusColor = '#DD9745';
        statusBG = '#DD97451A';
        statusBorder = '#DD9745';
        break;

      /* ================= STOCK STATUS ================= */
      case 'STOCK_OUT':
        statusText = translations('STOCK_OUT');
        statusColor = '#F16B6B';
        statusBG = '#F16B6B1A';
        statusBorder = '#F16B6B';
        break;

      case 'STOCK_IN':
        statusText = translations('STOCK_IN');
        statusColor = '#39C06F';
        statusBG = '#39C06F1A';
        statusBorder = '#39C06F';
        break;

      /* ================= DISPATCH NOTE ================= */
      case 'DRAFT':
        statusText = translations('DRAFT');
        statusColor = '#F8BA05';
        statusBG = '#F8BA051A';
        statusBorder = '#F8BA05';
        break;

      case 'READY_FOR_DISPATCH':
        statusText = translations('READY_FOR_DISPATCH');
        statusColor = '#288AF9';
        statusBG = '#288AF91A';
        statusBorder = '#288AF9';
        break;

      case 'IN_TRANSIT':
        statusText = translations('IN_TRANSIT');
        statusColor = '#F8BA05';
        statusBG = '#F8BA051A';
        statusBorder = '#F8BA05';
        break;

      /* ================= SERVICE ACTIVE / INACTIVE ================= */
      case true:
        statusText = 'Active';
        statusColor = '#39C06F';
        statusBG = '#39C06F1A';
        statusBorder = '#39C06F';
        break;

      case false:
        statusText = 'Inactive';
        statusColor = '#ffffff';
        statusBG = '#696969';
        statusBorder = '#0e0e0e';
        break;

      /*  GRNs  */
      case 'SHORT_QUANTITY':
        statusText = 'Short Delivery';
        statusColor = '#F8BA05';
        statusBG = '#F8BA051A';
        statusBorder = '#F8BA05';
        break;

      // QC
      case 'PARTIALLY_COMPLETED':
        statusText = 'QC Ongoing';
        statusColor = '#288AF9';
        statusBG = '#288AF91A';
        statusBorder = '#288AF9';
        break;

      default:
        return '-';
    }
  }

  return (
    <p
      className={clsx(
        'flex w-fit items-center justify-center gap-1 rounded border px-1.5 py-1 text-xs font-bold',
        className,
      )}
      style={{
        color: statusColor,
        backgroundColor: statusBG,
        borderColor: statusBorder,
      }}
    >
      {statusText}
    </p>
  );
};

export default ConditionalRenderingStatus;
