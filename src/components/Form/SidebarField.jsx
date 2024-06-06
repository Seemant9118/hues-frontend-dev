import { useDrag } from 'react-dnd';

const SidebarField = ({ item, disable = false }) => {
  const { icon: Icon } = item;
  const [, ref] = useDrag({
    type: 'INPUT',
    item: { ...item },
  });

  if (disable) {
    return (
      <div className="flex items-center bg-white py-1 pl-8 pr-4 text-sm font-semibold leading-normal text-primary">
        <div className="mr-2 h-4 w-4">
          <Icon size={16} />
        </div>
        {item.name}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex cursor-grab items-center bg-white py-1 pl-8 pr-4 text-sm font-semibold leading-normal text-primary hover:bg-primary/10"
    >
      <div className="mr-2 h-4 w-4">
        <Icon size={13} />
      </div>
      {item.name}
    </div>
  );
};

export default SidebarField;
