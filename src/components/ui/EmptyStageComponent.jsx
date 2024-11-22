import { Orbit } from 'lucide-react';
import Wrapper from '../wrappers/Wrapper';

const EmptyStageComponent = ({ heading, subItems }) => {
  return (
    <Wrapper className="flex h-[85vh] items-center justify-center rounded-md border bg-gray-50">
      <div className="flex w-1/2 flex-col gap-8">
        <h1 className="text-center text-xl font-bold">{heading}</h1>
        <ul className="grid grid-cols-2 grid-rows-2 gap-5">
          {subItems?.map((subItem) => (
            <li
              key={subItem.id}
              className="flex items-center gap-2 rounded-sm border p-2"
            >
              <span className="rounded-full bg-[#F6F9FF] p-3">
                {subItem.icon ? subItem.icon : <Orbit size={10} />}
              </span>
              <span className="text-sm font-semibold text-[#A5ABBD]">
                {subItem.subItemtitle}
              </span>{' '}
              {subItem.item}
            </li>
          ))}
        </ul>
      </div>
    </Wrapper>
  );
};

export default EmptyStageComponent;
