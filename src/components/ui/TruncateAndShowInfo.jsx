import { Info } from 'lucide-react';
import Tooltips from '../auth/Tooltips';

export const TruncateAndShowInfo = ({ text, limit = 80 }) => {
  if (!text) return 'Not available';

  const isLong = text.length > limit;
  const shortText = isLong ? `${text.slice(0, limit)}...` : text;

  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <span className="text-gray-900">{shortText}</span>

      {isLong && (
        <Tooltips
          trigger={
            <span className="inline-flex cursor-pointer align-middle">
              <Info size={14} className="text-gray-400 hover:text-gray-600" />
            </span>
          }
          content={text}
        />
      )}
    </span>
  );
};
