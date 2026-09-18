'use client';

import { Globe, ShieldCheck } from 'lucide-react';
import React from 'react';

export default function ShareModeSelector({ sharingType, onChange, disabled }) {
  const modes = [
    {
      id: 'PUBLIC',
      title: 'Public Share Link',
      badge: 'Quick & Frictionless',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Globe,
      iconBg: 'bg-emerald-100/70 text-emerald-600',
      description:
        'Anyone with the shared link can open and submit responses. No login or identity verification required.',
    },
    {
      id: 'PRIVATE',
      title: 'Private Restricted Link',
      badge: 'PAN & OTP Verified',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: ShieldCheck,
      iconBg: 'bg-blue-100/70 text-blue-600',
      description:
        'Restricted to a specific recipient. They must verify their identity matching PAN & Mobile with SMS OTP before access.',
    },
  ];

  return (
    <div className="flex flex-col gap-3 px-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
          Select Sharing Method
        </label>
        <span className="text-[11px] text-neutral-400">
          Choose who can open and submit this form
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {modes.map((mode) => {
          const isSelected = sharingType === mode.id;
          const Icon = mode.icon;

          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(mode.id)}
              className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
              } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <div className="flex w-full items-start justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${mode.iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${mode.badgeColor}`}
                >
                  {mode.badge}
                </span>
              </div>

              <div className="mt-3">
                <h4
                  className={`text-sm font-bold ${
                    isSelected ? 'text-primary' : 'text-neutral-800'
                  }`}
                >
                  {mode.title}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  {mode.description}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isSelected ? 'bg-primary' : 'border border-neutral-300'
                  }`}
                />
                <span
                  className={
                    isSelected
                      ? 'font-semibold text-primary'
                      : 'text-neutral-400'
                  }
                >
                  {isSelected ? 'Selected' : 'Click to select'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
