const DashCard = ({ title, numbers, growth, icon }) => {
  return (
    <div className="flex h-28 w-full max-w-xs flex-col justify-between rounded-xl border bg-white px-6 py-3 sm:max-w-sm md:max-w-md lg:max-w-lg">
      {/* Title and Icon */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
          {icon}
        </div>
      </div>

      {/* Numbers */}
      <div className="text-4xl font-semibold">{numbers}</div>

      {/* Growth Percentage */}
      {growth && (
        <div className="flex items-center text-sm text-green-600">
          <span className="mr-1">▲</span> {growth}
        </div>
      )}
    </div>
  );
};

export default DashCard;
