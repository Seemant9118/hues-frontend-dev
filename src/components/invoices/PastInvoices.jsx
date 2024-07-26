import { Download } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';

function PastInvoices() {
  return (
    <div className="scrollBarStyles flex max-h-[100vh] flex-col gap-2 overflow-auto">
      <div className="flex flex-col gap-2 rounded-lg border bg-gray-100 p-4">
        <div className="flex justify-between">
          <h1 className="text-xl font-bold">#1</h1>
          <Button variant="outline">
            <Download size={16} />
            Invoice
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <ul className="flex flex-col gap-2 text-sm">
            <li className="grid grid-cols-4 font-bold">
              <span>ITEM</span>
              <span>QUANTITY</span>
              <span>DATE</span>
              <span>AMOUNT</span>
            </li>
            <li className="grid grid-cols-4">
              <span>Rin</span>
              <span>20</span>
              <span>20/07/2024</span>
              <span>$3249.90</span>
            </li>
            <li className="grid grid-cols-4">
              <span>Lux Soap</span>
              <span>20</span>
              <span>20/07/2024</span>
              <span>$3249.90</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PastInvoices;
