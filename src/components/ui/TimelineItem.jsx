import moment from 'moment';

const formatTitle = (action, module, details) => {
  if (action === 'PAYMENT' && details?.amount) {
    return `A payment of ₹${parseFloat(details.amount).toFixed(2)} received`;
  }

  if (action === 'CREATE_INVOICE' && details?.amount) {
    return `Invoice raised for ₹${parseFloat(details.amount).toFixed(2)}`;
  }

  if (action === 'ORDER_NEGOTIATION_ACCEPTED') {
    return 'Order accepted';
  }

  if (action === 'ORDER_NEGOTIATION') {
    if (module === 'OFFER') return 'Offer sent to the buyer';
    if (module === 'BID') {
      // You can refine logic using timestamps or directionality if needed
      return 'Bid received from Buyer';
    }
  }

  if (action === 'CREATE_ORDER') {
    return 'New Order created';
  }

  if (action === 'UPDATE_ORDER') {
    return 'Order Revised';
  }

  // Fallback for unmapped cases
  return `${action}_${module}`
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const TimelineItem = ({ action, module, details, dateTime, isLast }) => {
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
          {formatTitle(action, module, details)}
        </div>
        <div className="text-xs text-gray-500">
          {moment(dateTime).format('DD/MM/YYYY | hh:mm A')}
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
