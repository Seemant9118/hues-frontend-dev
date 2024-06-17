import { Orbit } from 'lucide-react';

const EmptyStageComponent = ({ heading, subItems }) => {
  return (
    <div className="my-5 flex flex-col justify-center gap-2 rounded-md bg-gray-100 p-5">
      <h1 className="text-sm font-bold italic">{heading}</h1>
      <div className="flex flex-col gap-1 px-2">
        {/* <h2 className="text-sm font-bold">{subHeading} : </h2> */}
        <ul className="flex flex-col gap-2 px-6 text-sm text-neutral-500">
          {subItems?.map((subItem) => (
            <li key={subItem.id} className="flex items-center gap-2">
              <span>{subItem.icon ? subItem.icon : <Orbit size={10} />}</span>
              <span className="font-semibold text-neutral-500">
                {subItem.subItemtitle}
              </span>{' '}
              {subItem.item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmptyStageComponent;
