import { Search } from 'lucide-react';
import { Input } from './input';

const SearchInput = ({ toSearchTerm, setToSearchTerm }) => {
  return (
    <div className="relative mb-2">
      <Input
        type="text"
        placeholder="Search ..."
        className="p-2"
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
