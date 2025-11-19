import clsx from 'clsx';
import { useTranslations } from 'next-intl';

const ConditionalRenderingStatus = ({
  status,
  isPayment,
  isSellerPage,
  className,
}) => {
  const translations = useTranslations('components.conditionalRenderingStatus');
  let statusText;
  let statusColor;
  let statusBG;
  let statusBorder;

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
    case 'OFFER_SENT':
      statusText = translations('OFFER_SENT');
      statusColor = '#DD9745';
      statusBG = '#DD97451A';
      statusBorder = '#DD9745';
      break;
    case 'OFFER_RECEIVED':
      statusText = translations('OFFER_RECEIVED');
      statusColor = '#DD9745';
      statusBG = '#DD97451A';
      statusBorder = '#DD9745';
      break;
    case 'BID_SENT':
      statusText = translations('BID_SENT');
      statusColor = '#DD9745';
      statusBG = '#DD97451A';
      statusBorder = '#DD9745';
      break;
    case 'BID_RECEIVED':
      statusText = translations('BID_RECEIVED');
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
      statusText = translations('INVOICED');
      statusColor = '#6EAFFC';
      statusBG = '#6EAFFC1A';
      statusBorder = '#6EAFFC';
      break;
    case 'PARTIAL_INVOICED':
      statusText = translations('PARTIAL_INVOICED');
      statusColor = '#6EAFFC';
      statusBG = '#6EAFFC1A';
      statusBorder = '#6EAFFC';
      break;
    case 'WITHDRAWN':
      statusText = translations('WITHDRAWN');
      statusColor = '#F16B6B';
      statusBG = '#F16B6B1A';
      statusBorder = '#F16B6B';
      break;
    case 'REJECTED':
      statusText = translations('REJECTED');
      statusColor = '#F16B6B';
      statusBG = '#F16B6B1A';
      statusBorder = '#F16B6B';
      break;

    // paymentStatus
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

    // debit/credit note status
    case 'NOT_RAISED':
      statusText = translations('NOT_RAISED');
      break;
    case 'RAISED':
      statusText = translations('RAISED');
      statusColor = '#DD9745';
      statusBG = '#DD97451A';
      statusBorder = '#DD9745';
      break;

    // stock status
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

    // dispatch note status
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

    default:
      return null;
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
