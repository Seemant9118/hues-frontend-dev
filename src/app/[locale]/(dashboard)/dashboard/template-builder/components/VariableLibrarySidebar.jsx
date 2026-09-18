import React from 'react';

export default function VariableLibrarySidebar({
  dynamicVariableLibrary,
  editor,
}) {
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

              <div className="flex flex-wrap gap-1.5">
                {group.items.map((v) => (
                  <div
                    key={v.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, v)}
                    onClick={() => handleInsertVariable(v)}
                    className="flex cursor-grab select-none items-center rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-100 active:cursor-grabbing"
                    title={
                      v.description ||
                      'Drag into editor or click to insert at cursor'
                    }
                  >
                    {`{{${v.label}}}`}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
