'use client';

const ExplantoryText = ({ text = 'Information' }) => {
  return (
    <span className="mb-2 w-full text-justify text-sm tracking-tight">
      {text}
    </span>
  );
};

export default ExplantoryText;
