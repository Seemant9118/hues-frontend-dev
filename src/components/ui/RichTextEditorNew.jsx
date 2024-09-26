'use client';

import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './button';

const modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'script'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    ['image'],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'image',
];

const RichTextEditorNew = () => {
  const [value, setValue] = useState('');
  const [preview, setPreview] = useState(false);

  // Handler to toggle preview
  const handlePreview = () => {
    setPreview(!preview);
  };

  // Handler to clear editor content
  const handleClear = () => {
    setValue('');
    setPreview(false);
  };

  return (
    <div className="quill-container mt-2 flex flex-col gap-2">
      {/* Preview Button */}
      {value && (
        <div className="flex justify-between">
          <Button
            onClick={handlePreview}
            size="sm"
            debounceTime="0"
            className="bg-blue-500 p-2 text-white hover:bg-blue-600"
          >
            {preview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      )}

      {/* Display Preview Below Editor */}
      {preview && (
        <div className="rounded-lg border border-gray-200 bg-gray-100 p-4">
          <h3 className="text-lg font-semibold">Preview</h3>
          <div dangerouslySetInnerHTML={{ __html: value }} className="prose" />
        </div>
      )}
      {/* React Quill Editor */}
      <ReactQuill
        disabled
        value={value}
        onChange={setValue}
        modules={modules}
        formats={formats}
        theme="snow"
        className="rounded-lg"
      />

      {/* Comment and Clear Buttons */}
      <div className="flex justify-end gap-2">
        {/* Clear Button */}
        <Button
          size="sm"
          onClick={handleClear}
          className="bg-red-500 p-2 text-white hover:bg-red-600"
        >
          Clear
        </Button>

        {/* Comment Button */}
        <Button
          size="sm"
          onClick={() => {}}
          className="bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          Comment
        </Button>
      </div>
    </div>
  );
};

export default RichTextEditorNew;
