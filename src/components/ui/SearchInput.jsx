import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Input } from './input';

const SearchInput = ({
  toSearchTerm,
  setToSearchTerm,
  className,
  searchPlaceholder,
}) => {
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={searchPlaceholder}
        className={cn('p-2', className)}
        name="customer-name"
        value={toSearchTerm}
        onChange={(e) => setToSearchTerm(e.target.value)}
      />
      <Search
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer bg-white"
        size={16}
      />
    </div>
  );
};

export default SearchInput;
