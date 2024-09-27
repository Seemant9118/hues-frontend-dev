'use client';

import { CreditNoteApi } from '@/api/creditNote/CreditNoteApi';
import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { exportTableToExcel, LocalStorageService } from '@/lib/utils';
import { getAllCreditNotes } from '@/services/Credit_Note_Services/CreditNoteServices';
import { getAllDebitNotes } from '@/services/Debit_Note_Services/DebitNoteServices';
import { getAllInvoices } from '@/services/Invoice_Services/Invoice_Services';
import { Tabs } from '@radix-ui/react-tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  DatabaseZap,
  FileCheck,
  FileText,
  KeySquare,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import emptyImg from '../../../../../public/Empty.png';
import { useDebitNotesColumns } from './useDebitNotesColumns';
import { useSalesInvoicesColumns } from './useSalesInvoicesColumns';

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
  // Assuming LocalStorageService is fetching enterpriseId correctly
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const router = useRouter();
  const [tab, setTab] = useState('all');
  const [invoices, setInvoices] = useState([]);

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const onRowClick = (row) => {
    router.push(`/sales/sales-invoices/${row.id}`);
  };

  // Mutation for fetching invoices
  const getInvoiceMutation = useMutation({
    mutationKey: [invoiceApi.getAllInvoices.endpointKey],
    mutationFn: getAllInvoices,
    onSuccess: (data) => {
      setInvoices(data?.data?.data || []); // Ensure to avoid undefined issues
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const { data: debitNotesList, isLoading: debitNoteIsLoading } = useQuery({
    queryKey: [DebitNoteApi.getAllDebitNotes.endpointKey, enterpriseId],
    queryFn: () => getAllDebitNotes(enterpriseId),
    enabled: tab === 'debitNote',
    select: (debitNotesList) => debitNotesList.data.data,
  });

  const { data: creditNotesList, isLoading: creditNoteIsLoading } = useQuery({
    queryKey: [CreditNoteApi.getAllCreditNotes.endpointKey, enterpriseId],
    queryFn: () => getAllCreditNotes(enterpriseId),
    enabled: tab === 'creditNote',
    select: (creditNotesList) => creditNotesList.data.data,
  });

  // Effect to trigger the invoice fetching API call when component mounts or when enterpriseId changes
  useEffect(() => {
    if (tab === 'all') {
      getInvoiceMutation.mutate({
        id: enterpriseId,
        data: { pendingInvoiceNeeded: false },
      });
    } else if (tab === 'pending') {
      getInvoiceMutation.mutate({
        id: enterpriseId,
        data: { pendingInvoiceNeeded: true },
      });
    }
  }, [tab]);

  // Assuming useinvoiceColumns is a valid hook or function to generate the table columns
  const invoiceColumns = useSalesInvoicesColumns();
  const debitNotesColumns = useDebitNotesColumns();

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
              <Upload size={16} />
            </Button>
          </div>
        </SubHeader>

        <section>
          <Tabs value={tab} onValueChange={onTabChange} defaultValue={'all'}>
            <section className="sticky top-14 z-10 bg-white">
              <TabsList className="border">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="debitNote">Debit Notes</TabsTrigger>
                <TabsTrigger value="creditNote">Credit Notes</TabsTrigger>
              </TabsList>
            </section>

            <TabsContent value="all">
              {getInvoiceMutation.isPending && <Loading />}
              {!getInvoiceMutation.isPending && invoices?.length > 0 && (
                <DataTable
                  id={'sale-invoice'}
                  columns={invoiceColumns}
                  data={invoices}
                />
              )}
              {!getInvoiceMutation.isPending && invoices?.length === 0 && (
                <EmptyStageComponent
                  heading={SaleEmptyStageData.heading}
                  desc={SaleEmptyStageData.desc}
                  subHeading={SaleEmptyStageData.subHeading}
                  subItems={SaleEmptyStageData.subItems}
                />
              )}
            </TabsContent>
            <TabsContent value="pending">
              {getInvoiceMutation.isPending && <Loading />}
              {!getInvoiceMutation.isPending && invoices?.length > 0 && (
                <DataTable
                  id={'sale-invoice'}
                  columns={invoiceColumns}
                  data={invoices}
                />
              )}
            </TabsContent>
            <TabsContent value="debitNote">
              {debitNoteIsLoading && <Loading />}
              {!debitNoteIsLoading && debitNotesList?.length > 0 && (
                <DataTable
                  id={'sale-invoice-debits'}
                  columns={debitNotesColumns}
                  onRowClick={onRowClick}
                  data={debitNotesList}
                />
              )}

              {!debitNoteIsLoading && debitNotesList?.length === 0 && (
                <div className="flex h-[26rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                  <Image src={emptyImg} alt="emptyIcon" />
                  <p>No Debit Note Raised</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="creditNote">
              {creditNoteIsLoading && <Loading />}
              {!creditNoteIsLoading && creditNotesList?.length > 0 && (
                <DataTable
                  id={'sale-invoice-credits'}
                  columns={debitNotesColumns}
                  data={creditNotesList}
                />
              )}

              {!creditNoteIsLoading && creditNotesList?.length === 0 && (
                <div className="flex h-[26rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                  <Image src={emptyImg} alt="emptyIcon" />
                  <p>No Credit Note Raised</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </Wrapper>
    </>
  );
};

export default SalesInvoices;
