import { Clock3 } from 'lucide-react';

const ConditionalRenderingStatus = ({ status }) => {
  let statusText;
  let statusColor;
  let statusBG;
  let statusBorder;

  switch (status) {
    case 'ACCEPTED':
      statusText = 'Accepted';
      statusColor = '#39C06F';
      statusBG = '#39C06F1A';
      statusBorder = '#39C06F';
      break;
    case 'NEW':
      statusText = 'New';
      statusColor = '#288AF9';
      statusBG = '#288AF91A';
      statusBorder = '#288AF9';
      break;
    case 'NEGOTIATION':
      statusText = 'Negotiation';
      statusColor = '#F8BA05';
      statusBG = '#F8BA051A';
      statusBorder = '#F8BA05';
      break;
    case 'INVOICED':
      statusText = 'Invoiced';
      statusColor = '#6EAFFC';
      statusBG = '#6EAFFC1A';
      statusBorder = '#6EAFFC';
      break;
    case 'WITHDRAWN':
      statusText = 'Withdrawn';
      statusColor = '#F16B6B';
      statusBG = '#F16B6B1A';
      statusBorder = '#F16B6B';
      break;

    // paymentStatus
    case 'PAID':
      statusText = 'Paid';
      statusColor = '#39C06F';
      statusBG = '#39C06F1A';
      statusBorder = '#39C06F';
      break;
    case 'PARTIAL_PAID':
      statusText = 'Partial Paid';
      statusColor = '#288AF9';
      statusBG = '#288AF91A';
      statusBorder = '#288AF9';
      break;
    case 'NOT_PAID':
      statusText = (
        <>
          Payment <Clock3 size={12} />
        </>
      );
      statusColor = '#F8BA05';
      statusBG = '#F8BA051A';
      statusBorder = '#F8BA05';
      break;

    default:
      return null;
  }

  return (
    <div
      className="flex items-center justify-center gap-1 rounded border px-1.5 py-1 text-xs font-bold"
      style={{
        color: statusColor,
        backgroundColor: statusBG,
        borderColor: statusBorder,
      }}
    >
      {statusText}
    </div>
  );
};

export default ConditionalRenderingStatus;
