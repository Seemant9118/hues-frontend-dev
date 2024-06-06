'use client';

import { Columns } from '@/components/columns/columns';
import CreateOrder from '@/components/orders/CreateOrder';
import { DataTable } from '@/components/table/data-table';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { Layers2 } from 'lucide-react';
import { useState } from 'react';

export default function SalesInvoices() {
  const [products] = useState([
    {
      type: 'Type',
      product_name: 'Brand: Crocin',
      hsn_code: '#HUESGT45',
      description:
        'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration.',
      category: 'Business Planning',
      rate: '44',
      gst: 'HFSK6468T',
      amount: '23899',
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);

  return (
    <>
      {/* Main Table listing page */}
      {!isAdding && (
        <Wrapper>
          <SubHeader name={'Sales Invoices'}>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => setIsAdding(true)}
                variant={'blue_outline'}
                size="sm"
              >
                <Layers2 size={14} />
                Generate Sales Invoice
              </Button>
            </div>
          </SubHeader>
          <DataTable columns={Columns} data={products} />
        </Wrapper>
      )}
      {/* Generate Modal Handling */}
      {isAdding && (
        <CreateOrder
          onSubmit={() => {}}
          name="Create Invoice"
          onCancel={() => setIsAdding(false)}
        />
      )}
    </>
  );
}
