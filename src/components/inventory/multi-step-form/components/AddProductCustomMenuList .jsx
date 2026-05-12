import { components } from 'react-select';

export const CustomMenuList = (props) => {
  const inputValue = props?.selectProps?.inputValue || '';
  const showAfterSearch = inputValue.trim().length >= 3;

  // ✅ Check if options exist
  const hasOptions = props?.children && props.children.length > 0;

  return (
    <components.MenuList {...props}>
      {/* ✅ No Result Found */}
      {showAfterSearch && !hasOptions ? (
        <div className="px-3 py-2 text-sm text-gray-500">No result found</div>
      ) : (
        props.children
      )}

      {/* ✅ Show only when searched */}
      {showAfterSearch && (
        <div
          className="sticky bottom-0 cursor-pointer border-t bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-gray-100"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            props.selectProps.onAddNewProductType();
          }}
        >
          + Add a new product type
        </div>
      )}
    </components.MenuList>
  );
};
