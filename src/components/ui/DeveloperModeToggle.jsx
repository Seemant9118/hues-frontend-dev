'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDeveloperMode } from '@/context/DeveloperModeContext';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';
import { Code, X, Sliders, Wrench, GripVertical } from 'lucide-react';

export default function DeveloperModeToggle() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();

  const isFeatureEnabled = useFeatureFlag('DEVELOPER_MODE_TOGGLE');
  const { hasPermission } = usePermission();
  const hasConfigPermission = hasPermission('permission:form-config-manage');

  const {
    isDeveloperMode,
    setDeveloperMode,
    isGlobalToggleVisible,
    setGlobalToggleVisible,
  } = useDeveloperMode();

  // Draggable State
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const startPosRef = useRef({ offsetX: 0, offsetY: 0 });
  const hasMovedRef = useRef(false);

  // Load saved position from localStorage
  useEffect(() => {
    try {
      const savedPos = localStorage.getItem('devModeTogglePos');
      if (savedPos) {
        const parsed = JSON.parse(savedPos);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPosition(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Pointer Down (Mouse & Touch)
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;

    const element = dragRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    startPosRef.current = {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  // Pointer Move & Up listeners while dragging
  useEffect(() => {
    if (!isDragging) return () => {};

    const handlePointerMove = (e) => {
      const element = dragRef.current;
      if (!element) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const rect = element.getBoundingClientRect();
      let newX = clientX - startPosRef.current.offsetX;
      let newY = clientY - startPosRef.current.offsetY;

      // Clamp within screen boundaries
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      hasMovedRef.current = true;
      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging]);

  // Save position when position state changes
  useEffect(() => {
    if (position) {
      try {
        localStorage.setItem('devModeTogglePos', JSON.stringify(position));
      } catch (e) {
        // ignore
      }
    }
  }, [position]);

  if (!isFeatureEnabled || !hasConfigPermission) {
    return null;
  }

  const getStudioUrl = () => {
    const actionParam = searchParams?.get('action');
    const ctaParam = searchParams?.get('cta');
    const typeParam = searchParams?.get('type');

    // 1. Invoices
    if (pathname.includes('/sales/sales-invoices')) {
      if (actionParam === 'b2b') return '/dashboard/studio/SALES_B2BINVOICE';
      if (actionParam === 'b2c') return '/dashboard/studio/B2CINVOICE';
    }

    if (
      pathname.includes('/purchases/purchase-invoices') ||
      pathname.includes('/purchase-invoices')
    ) {
      return '/dashboard/studio/PURCHASE_B2BINVOICE';
    }

    // 2. Orders
    if (
      pathname.includes('/sales/sales-orders') ||
      pathname.includes('/sales-orders')
    ) {
      return '/dashboard/studio/SALES_ORDER';
    }

    if (
      pathname.includes('/purchases/purchase-orders') ||
      pathname.includes('/purchase-orders')
    ) {
      return '/dashboard/studio/PURCHASE_ORDER';
    }

    if (pathname.includes('/orders') || pathname.includes('/goods')) {
      if (
        ctaParam === 'bid' ||
        typeParam === 'bid' ||
        pathname.includes('/purchases')
      ) {
        return '/dashboard/studio/PURCHASE_ORDER';
      }
      return '/dashboard/studio/SALES_ORDER';
    }

    // 3. Payments
    if (
      pathname.includes('/purchases/purchase-payments') ||
      pathname.includes('/sales/sales-payments') ||
      pathname.includes('/payments')
    ) {
      return '/dashboard/studio/PAYMENT';
    }

    // 4. Forms / Templates detail page
    if (pathname.includes('/templates/forms/')) {
      const parts = pathname.split('/templates/forms/');
      if (parts[1]) return `/dashboard/studio/${parts[1]}`;
    }

    return '/dashboard/studio';
  };

  const handleShowBarClick = (e) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setGlobalToggleVisible(true);
  };

  // Collapsed Floating Button View
  if (!isGlobalToggleVisible) {
    return (
      <div
        ref={dragRef}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        style={
          position
            ? { left: `${position.x}px`, top: `${position.y}px` }
            : undefined
        }
        className={`fixed z-[9999] select-none ${
          position ? '' : 'right-4 top-4'
        }`}
      >
        <button
          type="button"
          onClick={handleShowBarClick}
          className={`flex items-center justify-center gap-1 rounded-full border border-blue-200 bg-white/95 p-2 text-blue-500 shadow-md backdrop-blur-sm transition-all hover:bg-blue-50 ${
            isDragging
              ? 'scale-105 cursor-grabbing'
              : 'cursor-grab hover:scale-105'
          }`}
          title="Drag to reposition | Click to show Developer Mode Bar"
        >
          <GripVertical className="h-3.5 w-3.5 text-slate-400" />
          <Sliders className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Expanded Developer Mode Bar View
  return (
    <div
      ref={dragRef}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      style={
        position
          ? { left: `${position.x}px`, top: `${position.y}px` }
          : undefined
      }
      className={`fixed z-[9999] flex select-none items-center gap-3.5 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-slate-800 shadow-lg backdrop-blur-sm transition-shadow ${
        position ? '' : 'left-1/2 top-4 -translate-x-1/2'
      } ${isDragging ? 'cursor-grabbing shadow-2xl' : 'cursor-grab'}`}
    >
      <div className="flex items-center gap-1.5" title="Drag to move bar">
        <GripVertical className="h-4 w-4 text-slate-300 hover:text-slate-500" />
        <div
          className={`rounded-full p-1.5 ${
            isDeveloperMode
              ? 'bg-blue-100 text-primary'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Code className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Dev Mode
        </span>
      </div>

      <div className="h-4 w-[1px] bg-slate-200" />

      <div className="flex items-center gap-3">
        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() => {
            if (hasMovedRef.current) return;
            setDeveloperMode(!isDeveloperMode);
          }}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isDeveloperMode ? 'bg-blue-500' : 'bg-slate-200'
          }`}
          role="switch"
          aria-checked={isDeveloperMode}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isDeveloperMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>

        <span
          className={`text-xs font-bold transition-colors ${
            isDeveloperMode ? 'animate-pulse text-primary' : 'text-slate-500'
          }`}
        >
          {isDeveloperMode ? 'ACTIVE' : 'OFF'}
        </span>
      </div>

      {/* "Customize in Studio" CTA Button */}
      {isDeveloperMode && (
        <>
          <div className="h-4 w-[1px] bg-slate-200" />
          <button
            type="button"
            onClick={() => {
              if (hasMovedRef.current) return;
              router.push(getStudioUrl());
            }}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow transition-all hover:bg-blue-700 active:scale-95"
            title="Open Form Customization in Studio"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Customize in Studio</span>
          </button>
        </>
      )}

      <div className="h-4 w-[1px] bg-slate-200" />

      {/* Hide Button */}
      <button
        type="button"
        onClick={() => {
          if (hasMovedRef.current) return;
          setGlobalToggleVisible(false);
        }}
        className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        title="Hide Dev Bar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
