'use client';

import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { exportTableToExcel } from '@/lib/utils';
import { Tabs } from '@radix-ui/react-tabs';
import {
  DatabaseZap,
  FileCheck,
  FileText,
  KeySquare,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import DebitNoteModal from '@/components/Modals/DebitNoteModal';
import { useinvoiceColumns } from './useInvoicesColumns';

const SalesInvoices = () => {
  const SaleEmptyStageData = {
    heading: `~"Seamlessly manage sales, from bids to digital negotiations and secure invoicing with digital
    signatures."`,
    subHeading: 'Features',
    subItems: [
      {
        id: 1,
        icon: <FileCheck size={14} />,
        subItemtitle: `Initiate sales and deals by receiving bids or making offers.`,
      },
      // { id: 2, subItemtitle: `Maximize impact by making or receiving offers on your catalogue.` },
      {
        id: 3,
        icon: <FileText size={14} />,
        subItemtitle: `Securely negotiate with digitally signed counter-offers and bids.`,
      },
      {
        id: 4,
        icon: <KeySquare size={14} />,
        subItemtitle: `Finalize deals with mutual digital signatures for binding commitment.`,
      },
      {
        id: 5,
        icon: <DatabaseZap size={14} />,
        subItemtitle: `Effortlessly create and share detailed invoices, completing sales professionally. `,
      },
    ],
  };

  const [tab, setTab] = useState('all');

  const onTabChange = (value) => {
    setTab(value);
  };

  const invoiceData = [
    {
      invoiceId: 'JQQRXF/INV/2425/0120',
      date: '28/08/2024',
      customer: 'Parth Enterprises',
      orderId: '876',
      totalAmount: '2500',
      isPaid: true,
    },

    {
      invoiceId: 'JQQRXF/INV/2425/0120',
      date: '28/08/2024',
      customer: 'Parth Enterprises',
      orderId: '876',
      totalAmount: '2500',
      isPaid: true,
    },

    {
      invoiceId: 'JQQRXF/INV/2425/0120',
      date: '28/08/2024',
      customer: 'Techpix',
      orderId: '876',
      totalAmount: '2500',
      isPaid: false,
    },
  ];

  const filteredInvoicedData = invoiceData.filter((invoice) => !invoice.isPaid);

  const invoiceColumns = useinvoiceColumns();

  return (
    <>
      <Wrapper>
        <SubHeader
          name={'Invoices'}
          className="sticky top-0 z-10 flex items-center justify-between bg-white"
        >
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => exportTableToExcel('sale-invoice', 'invoice_list')}
              variant="outline"
              className="border border-[#A5ABBD] hover:bg-neutral-600/10"
              size="sm"
            >
              <Upload size={14} />
            </Button>
          </div>
        </SubHeader>

        <section>
          <Tabs value={tab} onValueChange={onTabChange} defaultValue={'all'}>
            <section className="sticky top-14 z-10 bg-white">
              <TabsList className="border">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="debitNote">Debit Note</TabsTrigger>
                <TabsTrigger value="creditNote">Credit Note</TabsTrigger>
              </TabsList>
            </section>

            <TabsContent value="all">
              <DataTable
                id={'sale-invoice'}
                columns={invoiceColumns}
                data={invoiceData}
              />
              <EmptyStageComponent
                heading={SaleEmptyStageData.heading}
                desc={SaleEmptyStageData.desc}
                subHeading={SaleEmptyStageData.subHeading}
                subItems={SaleEmptyStageData.subItems}
              />
            </TabsContent>
            <TabsContent value="pending">
              <DataTable
                id={'sale-invoice'}
                columns={invoiceColumns}
                data={filteredInvoicedData}
              />
            </TabsContent>
            <TabsContent value="debitNote">
              <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-customShadow">
                <section className="flex items-center justify-between">
                  <div className="flex flex-col gap-4">
                    <h1 className="text-sm font-bold">JQQRXF/INV/2425/0120</h1>
                    <div className="flex gap-10">
                      <h1 className="text-sm">
                        <span className="font-bold text-[#ABB0C1]">
                          Date :{' '}
                        </span>
                        <span className="text-[#363940]">28/08/2024</span>
                      </h1>
                      <h1 className="text-sm">
                        <span className="font-bold text-[#ABB0C1]">
                          Total Amount :{' '}
                        </span>
                        <span className="font-bold text-[#363940]">
                          2000.00
                        </span>
                        <span> (inc. GST)</span>
                      </h1>
                      <h1 className="text-sm font-bold">
                        <span className="font-bold text-[#ABB0C1]">
                          Type :{' '}
                        </span>
                        <span className="font-bold text-[#363940]">Goods</span>
                      </h1>
                    </div>
                  </div>
                </section>

                <h1 className="text-sm">
                  <span className="font-bold text-[#ABB0C1]">Reason : </span>
                  <span className="text-[#363940]">
                    2 out of 100 soaps were expired and 5 of the total shampoo
                    bottles were empty
                  </span>
                </h1>

                <DataTable columns={invoiceColumns} data={invoiceData} />

                <div className="sticky bottom-0 z-10 flex justify-end gap-2">
                  <DebitNoteModal cta="reject" />
                  <DebitNoteModal cta="accept" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="creditNote">Credit Notes</TabsContent>
          </Tabs>
        </section>
      </Wrapper>
    </>
  );
};

export default SalesInvoices;
