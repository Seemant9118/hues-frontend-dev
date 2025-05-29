import moment from 'moment';

const formatTitle = (title) => {
  // Map known titles to user-friendly labels
  const titleMap = {
    PAYMENT: 'Payment Received',
    CREATE_INVOICE: 'New Invoice Created',
    ORDER_NEGOTIATION_ACCEPTED: 'Offer Accepted',
    ORDER_NEGOTIATION: 'Negotiation Recieved',
    CREATE_ORDER: 'New Order Created',
  };

  // Return mapped value or fallback to formatted version
  return (
    titleMap[title] ||
    title
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

const TimelineItem = ({ title, dateTime, isLast }) => {
  return (
    <div className="relative pl-6">
      {/* Dotted vertical line */}
      {!isLast && (
        <div className="absolute left-[4.4px] top-5 z-0 h-full border border-dotted border-gray-500" />
      )}

      {/* Circle */}
      <div className="absolute left-0 top-2 z-10 h-3 w-3 rounded-full border-2 border-muted bg-primary" />

      {/* Content */}
      <div className="pb-6">
        <div className="text-sm font-medium text-gray-900">
          {formatTitle(title)}
        </div>
        <div className="text-xs text-gray-500">
          {moment(dateTime).format('DD/MM/YYYY | hh:mm A')}
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
