export default function ItemTypeHeader({
  title = 'Category',
  status = 'Active',
  hsn = 'ABC-38399',
  categoryPath = ['Category', 'Sub Category'],
}) {
  const isActive = status === 'Active';

  return (
    <div className="flex w-full items-start justify-between rounded-xl border bg-white px-6 py-5 shadow-sm">
      {/* Left Section */}
      <div className="space-y-2">
        {/* Title + Status */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isActive ? 'bg-accent text-primary' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {status}
          </span>
        </div>

        {/* HSN + Breadcrumb */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="rounded-sm border border-green-600 bg-green-100 p-1 text-sm text-green-600">
            HSN: {hsn}
          </span>

          <span className="text-gray-700">{categoryPath.join(' > ')}</span>
        </div>
      </div>

      {/* Right Section */}
      {/* <Button
        size="sm"
        variant="outline"
        onClick={onMarkComplete}
        // className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
      >
        <CheckCircle size={16} className="text-green-500" />
        Mark type complete
      </Button> */}
    </div>
  );
}
