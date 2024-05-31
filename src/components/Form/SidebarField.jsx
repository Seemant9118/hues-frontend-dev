import { useDrag } from "react-dnd";

const SidebarField = ({ item, disable = false }) => {
  const { icon: Icon } = item;
  const [, ref] = useDrag({
    type: "INPUT",
    item: { ...item },
  });

  if (disable) {
    return (
      <div className="flex items-center pl-8 pr-4 py-1 bg-white text-primary font-semibold text-sm leading-normal">
        <div className="w-4 h-4 mr-2">
          <Icon size={16} />
        </div>
        {item.name}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex items-center pl-8 pr-4 py-1 bg-white text-primary font-semibold text-sm leading-normal cursor-grab hover:bg-primary/10"
    >
      <div className="w-4 h-4 mr-2">
        <Icon size={13} />
      </div>
      {item.name}
    </div>
  );
};

export default SidebarField;
