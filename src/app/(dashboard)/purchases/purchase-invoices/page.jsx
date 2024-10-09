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
import { useMutation } from '@tanstack/react-query';
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
import { usePurchaseDebitNotesColumns } from './usePurchaseDebitNotesColumns';
import { usePurchaseInvoicesColumns } from './usePurchaseInvoicesColumns';

// macros
const PAGE_LIMIT = 10;

const PurchaseInvoices = () => {
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
      {
        id: 2,
        icon: <FileText size={14} />,
        subItemtitle: `Securely negotiate with digitally signed counter-offers and bids.`,
      },
      {
        id: 3,
        icon: <KeySquare size={14} />,
        subItemtitle: `Finalize deals with mutual digital signatures for binding commitment.`,
      },
      {
        id: 4,
        icon: <DatabaseZap size={14} />,
        subItemtitle: `Effortlessly create and share detailed invoices, completing sales professionally. `,
      },
    ],
  };

  // Assuming LocalStorageService is fetching enterpriseId correctly
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const router = useRouter();
  const [tab, setTab] = useState('all');
  const [invoices, setInvoices] = useState([]); // invoices
  const [debitNotes, setDebitNotes] = useState([]); // debitNotes
  const [creditNotes, setCreditNotes] = useState([]); // debitNotes
  const [paginationData, setPaginationData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterData, setFilterData] = useState(null);

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const onRowClick = (row) => {
    router.push(`/purchase/purchase-invoices/${row.id}`);
  };

  // [INVOICES_FETCHING]
  // Mutation for fetching invoices
  const getInvoiceMutation = useMutation({
    mutationKey: [invoiceApi.getAllInvoices.endpointKey],
    mutationFn: getAllInvoices,
    onSuccess: (data) => {
      const _newInvoicesData = data.data.data.data;
      setPaginationData(data.data.data);

      if (filterData) {
        setInvoices(_newInvoicesData);
      } else {
        setInvoices([...invoices, ..._newInvoicesData]);
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });
  //  invoice condition for invoke
  useEffect(() => {
    if (enterpriseId) {
      if (tab === 'pending') {
        setFilterData({
          pendingInvoiceNeeded: true,
        });
      } else {
        setInvoices([]);
        setCurrentPage(1);
        setFilterData({
          pendingInvoiceNeeded: false,
        });
      }
    }
  }, [tab, enterpriseId]);
  // invoice inovke fn
  useEffect(() => {
    if (enterpriseId) {
      let _reqFilters = {
        page: 1,
        limit: PAGE_LIMIT,
      };
      if (filterData) {
        _reqFilters = {
          ..._reqFilters,
          ...filterData,
        };
      } else {
        _reqFilters.page = currentPage;
      }
      getInvoiceMutation.mutate({
        id: enterpriseId,
        data: _reqFilters,
      });
    }
  }, [filterData, enterpriseId, currentPage]);

  // [DEBIT_NOTES_FETCHING]
  // Mutation for fetching debitNotes
  const getDebitNotesMutation = useMutation({
    mutationKey: [DebitNoteApi.getAllDebitNotes.endpointKey],
    mutationFn: getAllDebitNotes,
    onSuccess: (data) => {
      const _newDebitNotesData = data.data.data.data;
      setPaginationData(data.data.data);

      if (filterData) {
        setDebitNotes(_newDebitNotesData);
      } else {
        setDebitNotes([...debitNotes, ..._newDebitNotesData]);
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });
  // debitNotes condition for invoke
  useEffect(() => {
    if (enterpriseId) {
      let _reqFilters = {
        page: 1,
        limit: PAGE_LIMIT,
      };
      if (filterData) {
        _reqFilters = {
          ..._reqFilters,
        };
      } else {
        _reqFilters.page = currentPage;
      }
      getDebitNotesMutation.mutate({
        id: enterpriseId,
        data: _reqFilters,
      });
    }
  }, [filterData, enterpriseId, currentPage]);

  // [CREDIT_NOTES_FETCHING]
  const getCreditNotesMutation = useMutation({
    mutationKey: [CreditNoteApi.getAllCreditNotes.endpointKey],
    mutationFn: getAllCreditNotes,
    onSuccess: (data) => {
      const _newCreditNotesData = data.data.data.data;
      setPaginationData(data.data.data);

      if (filterData) {
        setCreditNotes(_newCreditNotesData);
      } else {
        setCreditNotes([...debitNotes, ..._newCreditNotesData]);
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });
  // creditNotes condition for invoke
  useEffect(() => {
    if (enterpriseId) {
      let _reqFilters = {
        page: 1,
        limit: PAGE_LIMIT,
      };
      if (filterData) {
        _reqFilters = {
          ..._reqFilters,
        };
      } else {
        _reqFilters.page = currentPage;
      }
      getCreditNotesMutation.mutate({
        id: enterpriseId,
        data: _reqFilters,
      });
    }
  }, [filterData, enterpriseId, currentPage]);

  // Assuming useinvoiceColumns is a valid hook or function to generate the table columns
  const invoiceColumns = usePurchaseInvoicesColumns();
  const purchaseDebitNotesColumns = usePurchaseDebitNotesColumns();

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
                <TabsTrigger value="debitNote">Debit Note</TabsTrigger>
                <TabsTrigger value="creditNote">Credit Note</TabsTrigger>
              </TabsList>
            </section>

            <TabsContent value="all">
              {getInvoiceMutation.isPending && <Loading />}
              {!getInvoiceMutation.isPending && invoices?.length > 0 && (
                <DataTable
                  id={'sale-invoice'}
                  columns={invoiceColumns}
                  data={invoices}
                  filterData={filterData}
                  setFilterData={setFilterData}
                  paginationData={paginationData}
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
                  filterData={filterData}
                  setFilterData={setFilterData}
                  paginationData={paginationData}
                />
              )}
            </TabsContent>
            <TabsContent value="debitNote">
              {getDebitNotesMutation.isPending && <Loading />}
              {!getDebitNotesMutation.isPending && debitNotes?.length > 0 && (
                <DataTable
                  id={'sale-invoice-debits'}
                  columns={purchaseDebitNotesColumns}
                  onRowClick={onRowClick}
                  data={debitNotes}
                  filterData={filterData}
                  setFilterData={setFilterData}
                  paginationData={paginationData}
                />
              )}

              {!getDebitNotesMutation.isPending && debitNotes?.length === 0 && (
                <div className="flex h-[26rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                  <Image src={emptyImg} alt="emptyIcon" />
                  <p>No Debit Note Raised</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="creditNote">
              {getCreditNotesMutation.isPending && <Loading />}
              {!getCreditNotesMutation.isPending && creditNotes?.length > 0 && (
                <DataTable
                  id={'sale-invoice-credits'}
                  columns={purchaseDebitNotesColumns}
                  data={creditNotes}
                  filterData={filterData}
                  setFilterData={setFilterData}
                  paginationData={paginationData}
                />
              )}

              {!getCreditNotesMutation.isPending &&
                creditNotes.length === 0 && (
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

export default PurchaseInvoices;
