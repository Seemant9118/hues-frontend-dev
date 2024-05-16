import { Loader2 } from 'lucide-react';
import React from 'react'

const Loading = () => {
  return (
    <div className='w-full flex justify-center items-center'>
        <Loader2 className="animate-spin" />
    </div>
  )
};

export default Loading