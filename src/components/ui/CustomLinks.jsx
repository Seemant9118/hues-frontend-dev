import Link from 'next/link';
import React from 'react';

const CustomLinks = ({ href, linkName }) => {
  return (
    <Link
      href={href}
      className="rounded-sm border p-2 hover:border hover:border-[#288AF9] hover:font-semibold hover:text-black"
    >
      {linkName}
    </Link>
  );
};

export default CustomLinks;
