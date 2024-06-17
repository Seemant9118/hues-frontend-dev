'use client';

import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    [
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'script',
      'background',
      'color',
    ],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    ['link', 'image', 'video'],
    ['clean'],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
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
  'background',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
];

const RichTextEditor = ({
  disabled,
  input,
  setDroppedInputs,
  idx,
  preview = false,
  onSubmit,
  value: valueProp,
}) => {
  const [value, setValue] = useState(valueProp || input?.text || '');

  const appendInArray = () => {
    setDroppedInputs((prev) => {
      const updated = [...prev];
      prev[idx].text = value;
      return updated;
    });
  };

  return (
    <ReactQuill
      readOnly={disabled}
      formats={formats}
      className="ql-error"
      modules={modules}
      theme="snow"
      value={value}
      onChange={(val) => {
        setValue(val);
        if (preview) {
          onSubmit(val);
        }
      }}
      onBlur={preview ? () => onSubmit(value) : appendInArray}
    />
  );
};

export default RichTextEditor;
