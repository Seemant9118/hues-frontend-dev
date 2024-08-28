const ConditionalRenderingStatus = ({ status }) => {
  let statusText;
  let statusColor;
  let statusBG;
  let statusBorder;

  switch (status) {
    case 'ACCEPTED':
      statusText = 'ACCEPTED';
      statusColor = '#39C06F';
      statusBG = '#39C06F1A';
      statusBorder = '#39C06F';
      break;
    case 'NEW':
      statusText = 'NEW';
      statusColor = '#1863B7';
      statusBG = '#1863B71A';
      statusBorder = '#1863B7';
      break;
    case 'NEGOTIATION':
      statusText = 'NEGOTIATION';
      statusColor = '#F8BA05';
      statusBG = '#F8BA051A';
      statusBorder = '#F8BA05';
      break;
    default:
      return null;
  }

  return (
    <div
      className="flex max-w-fit items-center justify-center gap-1 rounded border px-1.5 py-2 text-sm font-bold"
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
