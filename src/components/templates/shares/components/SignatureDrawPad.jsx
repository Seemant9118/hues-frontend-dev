'use client';

import { RotateCcw } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export default function SignatureDrawPad({
  isOpen,
  isActive,
  onSignatureChange,
  onError,
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawContent, setHasDrawContent] = useState(false);

  // Setup canvas strokes when tab is active
  useEffect(() => {
    if (isActive && isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 400;
      canvas.height = 180;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isActive, isOpen]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawContent(true);
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    const base64Len = dataUrl.split(',')[1]?.length || 0;
    const byteSize = Math.floor((base64Len * 3) / 4);

    if (byteSize > 20480) {
      onError?.(
        `Signature drawing is too complex (${(byteSize / 1024).toFixed(1)} KB). Please clear and draw a simpler signature.`,
      );
      onSignatureChange?.(null);
    } else {
      onError?.(null);
      onSignatureChange?.(dataUrl);
    }
  };

  const handlePointerUpOrLeave = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasSignature();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawContent(false);
    onError?.(null);
    onSignatureChange?.(null);
  };

  if (!isActive) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-neutral-500">
          Draw your signature using mouse or finger:
        </span>
        {hasDrawContent && (
          <button
            type="button"
            onClick={clearCanvas}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700"
          >
            <RotateCcw size={12} /> Clear
          </button>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/70 p-2">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrLeave}
          onPointerLeave={handlePointerUpOrLeave}
          className="w-full cursor-crosshair touch-none rounded-lg bg-white shadow-inner"
        />
      </div>
    </div>
  );
}
