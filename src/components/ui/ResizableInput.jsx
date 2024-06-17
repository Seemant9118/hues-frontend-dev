import { cn } from '@/lib/utils';
import React from 'react';
import { useDrag } from 'react-dnd';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const ResizableInput = ({
  input,
  onResizeStop,
  index,
  onDragStop,
  coordinate,
  coordinateIndex,
  isFocussed,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'input',
    item: { id: input.id + index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        onDragStop(delta, `${input.id}|${index}`, coordinateIndex, index);
      }
    },
  });
  const handleResizeStop = (e, data) => {
    onResizeStop(data.size, `${input.id}|${index}`, index);
  };

  return (
    <div
      ref={drag}
      key={index}
      className={cn('', isDragging && 'opacity-90')}
      style={{
        position: 'absolute',
        top: coordinate.y,
        left: coordinate.x,
        width: input.width,
        height: input.height,
        zIndex: 5000000000,
      }}
    >
      <ResizableBox
        width={input.width || 100}
        height={input.height || 30}
        onResizeStop={handleResizeStop}
        minConstraints={[50, 20]}
        maxConstraints={[300, 100]}
      >
        <div>
          {/* Your input component */}
          <div
            style={{
              width: input.width || 100,
              height: input.height || 30,
            }}
            className={cn(
              'min-h-full min-w-full rounded border border-slate-400 shadow-lg',
              isFocussed ? 'bg-primary/20' : 'bg-white',
            )}
            type="text"
            defaultValue={input.label}
          />
        </div>
      </ResizableBox>
    </div>
  );
};

export default ResizableInput;
