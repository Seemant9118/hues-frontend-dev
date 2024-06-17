'use client';

import { orderApi } from '@/api/order_api/order_api';
import CreateOrder from '@/components/orders/CreateOrder';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import { GetSales } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import {
  DatabaseZap,
  FileCheck,
  FileText,
  KeySquare,
  PlusCircle,
  Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSalesColumns } from './useSalesColumns';

const SalesOrder = () => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [istype, setIsType] = useState('All');
  const [isCreatingSales, setIsCreatingSales] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  // const [isOrderView, setIsOrderView] = useState(false);

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

  const SalesColumns = useSalesColumns();

  const onRowClick = (row) => {
    router.push(`/sales-orders/${row.id}`);
  };

  const { data, isSuccess } = useQuery({
    queryKey: [orderApi.getSales.endpointKey],
    queryFn: () => GetSales(enterpriseId),
    select: (res) => res.data.data,
  });

  return (
    <>
      {!isCreatingSales && !isCreatingInvoice && (
        <Wrapper>
          <SubHeader name={'Sales'} className="z-10 bg-white">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-4">
                <Select
                  value={istype.type}
                  onValueChange={(value) => setIsType(value)}
                >
                  <SelectTrigger className="max-w-xs gap-5">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Bid">Bids</SelectItem>
                    <SelectItem value="offer">Offers</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => exportTableToExcel('sale-orders', 'sales_list')}
                variant={'blue_outline'}
                className="border-neutral-300 bg-neutral-500/10 text-neutral-600 hover:bg-neutral-600/10"
                size="sm"
              >
                <Upload size={14} />
                Export
              </Button>
              <Button
                onClick={() => setIsCreatingSales(true)}
                variant={'blue_outline'}
                size="sm"
              >
                <PlusCircle size={14} />
                Offer
              </Button>
              {/* <Button
                onClick={() => setIsCreatingInvoice(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <PlusCircle size={14} />
                Invoice
              </Button> */}
            </div>
          </SubHeader>
          {!enterpriseId || data?.length === 0 ? (
            <EmptyStageComponent
              heading={SaleEmptyStageData.heading}
              desc={SaleEmptyStageData.desc}
              subHeading={SaleEmptyStageData.subHeading}
              subItems={SaleEmptyStageData.subItems}
            />
          ) : (
            isSuccess && (
              <DataTable
                id={'sale-orders'}
                columns={SalesColumns}
                onRowClick={onRowClick}
                data={data}
              />
            )
          )}
        </Wrapper>
      )}

      {isCreatingSales && !isCreatingInvoice && (
        // && !isOrderView
        <CreateOrder
          type="sales"
          name="Offer"
          cta="offer"
          onCancel={() => setIsCreatingSales(false)}
        />
      )}

      {isCreatingInvoice && !isCreatingSales && (
        // && !isOrderView
        <CreateOrder
          type="sales"
          name="Invoice"
          cta="offer"
          onCancel={() => setIsCreatingInvoice(false)}
        />
      )}
    </>
  );
};

export default SalesOrder;
