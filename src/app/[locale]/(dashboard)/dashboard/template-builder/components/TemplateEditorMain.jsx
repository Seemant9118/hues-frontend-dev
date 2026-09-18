import React from 'react';
import { EditorContent } from '@tiptap/react';
import {
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Eye,
  Sparkles,
} from 'lucide-react';
import { MOCK_VALUES } from '../utils';

export default function TemplateEditorMain({
  editor,
  mode,
  setMode,
  templateName,
}) {
  // Helper to compile final content layout for preview resolving variables
  const getResolvedContentHtml = (html) => {
    if (typeof window === 'undefined') return html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const variables = doc.querySelectorAll('span[data-variable]');

    variables.forEach((el) => {
      const rawLabel = el.getAttribute('label') || el.textContent || '';
      const label = rawLabel.replace(/[{}]/g, '').trim();
      const resolvedValue = MOCK_VALUES[label] || label;

      const replacement = doc.createElement('span');
      replacement.className =
        'inline-block bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 mx-0.5 rounded text-xs border border-emerald-200 select-none';
      replacement.textContent = resolvedValue;
      el.replaceWith(replacement);
    });

    return doc.body.innerHTML;
  };

  return (
    <main className="flex h-full flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex h-full flex-col overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-sm">
        {/* Toolbar Area */}
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-neutral-50/50 px-4 py-2.5">
          {/* Editor controls - only visible in 'editor' mode */}
          <div className="flex items-center gap-1">
            {mode === 'editor' && editor ? (
              <>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  className={`rounded p-1.5 text-neutral-600 hover:bg-neutral-200 ${
                    editor.isActive('heading', { level: 1 })
                      ? 'bg-neutral-200 font-bold text-neutral-900'
                      : ''
                  }`}
                  title="Heading 1"
                >
                  <Heading1 size={15} />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  className={`rounded p-1.5 text-neutral-600 hover:bg-neutral-200 ${
                    editor.isActive('heading', { level: 2 })
                      ? 'bg-neutral-200 font-bold text-neutral-900'
                      : ''
                  }`}
                  title="Heading 2"
                >
                  <Heading2 size={15} />
                </button>
                <div className="mx-1 h-4 w-[1px] bg-neutral-200" />
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`rounded p-1.5 text-neutral-600 hover:bg-neutral-200 ${
                    editor.isActive('bold')
                      ? 'bg-neutral-200 font-bold text-neutral-900'
                      : ''
                  }`}
                  title="Bold"
                >
                  <Bold size={15} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`rounded p-1.5 text-neutral-600 hover:bg-neutral-200 ${
                    editor.isActive('italic')
                      ? 'bg-neutral-200 font-bold text-neutral-900'
                      : ''
                  }`}
                  title="Italic"
                >
                  <Italic size={15} />
                </button>
                <div className="mx-1 h-4 w-[1px] bg-neutral-200" />
                <button
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  className={`rounded p-1.5 text-neutral-600 hover:bg-neutral-200 ${
                    editor.isActive('bulletList')
                      ? 'bg-neutral-200 text-neutral-900'
                      : ''
                  }`}
                  title="Bullet List"
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  className={`rounded p-1.5 text-neutral-600 hover:bg-neutral-200 ${
                    editor.isActive('orderedList')
                      ? 'bg-neutral-200 text-neutral-900'
                      : ''
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered size={15} />
                </button>
                <div className="mx-1 h-4 w-[1px] bg-neutral-200" />
                <button
                  onClick={() => editor.chain().focus().undo().run()}
                  className="rounded p-1.5 text-neutral-600 hover:bg-neutral-200"
                  title="Undo"
                >
                  <Undo size={15} />
                </button>
                <button
                  onClick={() => editor.chain().focus().redo().run()}
                  className="rounded p-1.5 text-neutral-600 hover:bg-neutral-200"
                  title="Redo"
                >
                  <Redo size={15} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                <Eye size={14} className="text-emerald-500" />
                <span>
                  Preview Document Mode (Variables resolved with mock data)
                </span>
              </div>
            )}
          </div>

          {/* Mode Toggle Buttons */}
          <div className="flex items-center rounded-lg bg-neutral-200/60 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setMode('editor')}
              className={`rounded-md px-3 py-1 transition-all ${
                mode === 'editor'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`rounded-md px-3 py-1 transition-all ${
                mode === 'preview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Editing / Preview Content Area */}
        <div className="scrollBarStyles flex-1 overflow-y-auto bg-white">
          {mode === 'editor' ? (
            <div className="h-full">
              <EditorContent editor={editor} />
            </div>
          ) : (
            <div className="prose max-w-none p-8 text-neutral-800">
              <h1 className="mb-6 border-b pb-2 text-2xl font-bold">
                {templateName}
              </h1>
              <div
                dangerouslySetInnerHTML={{
                  __html: getResolvedContentHtml(
                    editor ? editor.getHTML() : '',
                  ),
                }}
              />
            </div>
          )}
        </div>

        {/* Bottom Editor Tip */}
        {mode === 'editor' && (
          <div className="flex shrink-0 items-center justify-between border-t border-neutral-100 bg-neutral-50 px-6 py-2.5 text-[11px] text-neutral-400">
            <span>
              Tip: Click or Drag and Drop variables from the library on the left
              directly into the text editor.
            </span>
            <span className="flex items-center gap-1 font-medium text-blue-500">
              <Sparkles size={11} /> Rich Template Builder
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
