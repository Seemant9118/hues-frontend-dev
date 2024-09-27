'use client';

import React from 'react';
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

const RichTextEditorNew = ({ value, setValue, onSubmit }) => {
  const handleClear = () => {
    setValue({ ...value, text: '' });
  };

  return (
    <div className="quill-container mt-2 flex flex-col gap-2">
      <ReactQuill
        value={value.text}
        onChange={(content) => setValue({ ...value, text: content })}
        modules={modules}
        formats={formats}
        theme="snow"
        className="rounded-lg"
      />

      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          onClick={handleClear}
          className="bg-red-500 p-2 text-white hover:bg-red-600"
        >
          Clear
        </Button>

        <Button
          size="sm"
          onClick={onSubmit}
          className="bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          Comment
        </Button>
      </div>
    </div>
  );
};

export default RichTextEditorNew;
