import React, { useState } from 'react';

export default function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded bg-black/80 text-white text-xs whitespace-nowrap z-50">
          {text}
        </div>
      )}
    </div>
  );
}
