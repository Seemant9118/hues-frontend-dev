'use client';

import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { isValidElement, useState } from 'react';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';

export default function Overview({
  data = {},
  labelMap = {}, // { orderId: "Order ID", ... }
  customRender = {}, // { orderStatus: (value)=> <CustomComponent /> }
  customLabelRender = {},
  collapsible = false,
  isPOD = false,
  isQC = false,
  isSeller,
  sectionClass = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full',
}) {
  const [isOpen, setIsOpen] = useState(false);

  const renderValue = (key, value) => {
    if (customRender[key]) return customRender[key](value);

    // If React element, render directly
    if (isValidElement(value)) return value;

    // If normal object, stringify
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    return String(value ?? '--');
  };

  const getLabel = (key) => {
    if (customLabelRender[key]) return customLabelRender[key]();

    const label = labelMap[key] || key.replace(/([A-Z])/g, ' $1').toUpperCase();
    return label;
  };

  return (
    <section className="mb-4 w-full rounded-md border p-4">
      {/* Collapsible Header */}
      {collapsible && (
        <div className="mb-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => setIsOpen(!isOpen)}
            debounceTime={0}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>

          {!isOpen && (
            <div className="flex w-full justify-between text-sm font-bold">
              {Object.keys(data)
                .slice(0, 4)
                .map((key) => (
                  <div key={key} className="flex flex-col">
                    <p className="text-sm text-gray-600">{getLabel(key)}</p>
                    <p className="text-base font-semibold">
                      {key !== 'status' && renderValue(key, data[key])}
                      {key === 'status' && (
                        <ConditionalRenderingStatus
                          status={data[key]}
                          isPOD={isPOD}
                          isQC={isQC}
                          isSeller={isSeller}
                        />
                      )}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Expanded Content */}
      {(!collapsible || isOpen) && (
        <section
          className={clsx(sectionClass, collapsible && 'animate-smoothDown')}
        >
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-600">
                {getLabel(key)}
              </p>
              <p className="text-base font-bold">
                {key !== 'status' && renderValue(key, value)}
                {key === 'status' && (
                  <ConditionalRenderingStatus
                    status={data[key]}
                    isPOD={isPOD}
                    isQC={isQC}
                    isSeller={isSeller}
                  />
                )}
              </p>
            </div>
          ))}
        </section>
      )}
    </section>
  );
}
