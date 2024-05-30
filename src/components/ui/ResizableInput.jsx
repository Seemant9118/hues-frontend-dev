import React from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { Input } from "@/components/ui/input";
import { useDrag } from "react-dnd";

const ResizableInput = ({ input, onResizeStop, index, onDragStop }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "input",
    item: { id: input?.id + index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        onDragStop(delta, input.id);
      }
    },
  });
  const handleResizeStop = (e, data) => {
    onResizeStop(data.size, input.id);
  };

  return (
    <div
      ref={drag}
      key={index}
      style={{
        position: "absolute",
        top: input.coords.y,
        left: input.coords.x,
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
            className={
              "min-h-full min-w-full border border-slate-400 bg-zinc-800 rounded"
            }
            type="text"
            defaultValue={input.label}
          />
        </div>
      </ResizableBox>
    </div>
  );
};

export default ResizableInput;
