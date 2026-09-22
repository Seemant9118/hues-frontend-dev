import { Info } from 'lucide-react';
import React, { useState } from 'react';
import VariableDetailsSheet from './VariableDetailsSheet';

export default function VariableLibrarySidebar({
  dynamicVariableLibrary,
  editor,
}) {
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDragStart = (e, variable) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'variable',
        label: variable.label,
        id: variable.id,
      }),
    );
  };

  const handleInsertVariable = (variable) => {
    if (editor) {
      editor.commands.insertContent({
        type: 'variable',
        attrs: {
          label: variable.label,
          id: variable.id,
        },
      });
      editor.commands.focus();
    }
  };

  const openDrawer = (variable) => {
    setSelectedVariable(variable);
    setIsDrawerOpen(true);
  };

  return (
    <aside className="flex h-full w-1/5 shrink-0 flex-col gap-4 overflow-hidden">
      <div className="flex h-full flex-col overflow-hidden rounded-sm border border-neutral-200 bg-white p-3 shadow-sm">
        <div className="shrink-0 border-b border-neutral-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Variable Library
          </h2>
          <p className="mt-1 text-[10px] text-neutral-400">
            Click a variable to insert, or drag & drop it in place.
          </p>
        </div>

        <div className="scrollBarStyles mt-4 flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {dynamicVariableLibrary.map((group) => (
            <div key={group.category} className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700">
                {group.icon}
                <span>{group.category}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {group.items.map((v) => (
                  <div
                    key={v.id}
                    className="group flex items-center justify-between rounded-lg border border-neutral-100 bg-white p-2 text-[11px] shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, v)}
                      onClick={() => handleInsertVariable(v)}
                      className="flex-1 cursor-grab select-none font-semibold text-blue-600 transition active:cursor-grabbing group-hover:text-blue-700"
                      title={
                        v.description ||
                        'Drag into editor or click to insert at cursor'
                      }
                    >
                      {`{{${v.label}}}`}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDrawer(v);
                      }}
                      className="ml-2 rounded p-1 text-neutral-400 opacity-0 transition-opacity hover:bg-blue-100 hover:text-blue-600 group-hover:opacity-100"
                      title="View Details"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <VariableDetailsSheet
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        selectedVariable={selectedVariable}
      />
    </aside>
  );
}
