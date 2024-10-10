'use client';

import { CreditNoteApi } from '@/api/creditNote/CreditNoteApi';
import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { getAllCreditNotes } from '@/services/Credit_Note_Services/CreditNoteServices';
import { getAllDebitNotes } from '@/services/Debit_Note_Services/DebitNoteServices';
import {
  exportInvoice,
  getAllInvoices,
} from '@/services/Invoice_Services/Invoice_Services';
import { updateReadTracker } from '@/services/Read_Tracker_Services/Read_Tracker_Services';
import { Tabs } from '@radix-ui/react-tabs';
import { useMutation } from '@tanstack/react-query';
import {
  DatabaseZap,
  FileCheck,
  FileText,
  KeySquare,
  PlusCircle,
  Upload,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import emptyImg from '../../../../../public/Empty.png';
import { useDebitNotesColumns } from './useDebitNotesColumns';
import { useSalesInvoicesColumns } from './useSalesInvoicesColumns';

// dynamic imports
const CreateOrder = dynamic(() => import('@/components/orders/CreateOrder'), {
  loading: () => <Loading />,
});

// macros
const PAGE_LIMIT = 10;

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
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const router = useRouter();
  const [tab, setTab] = useState('all');
  const [isInvoiceCreationSuccess, setIsInvoiceCreationSuccess] =
    useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [invoices, setInvoices] = useState([]); // invoices
  const [debitNotes, setDebitNotes] = useState([]); // debitNotes
  const [creditNotes, setCreditNotes] = useState([]); // debitNotes
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [paginationData, setPaginationData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterData, setFilterData] = useState(null);

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const updateReadTrackerMutation = useMutation({
    mutationKey: [readTrackerApi.updateTrackerState.endpointKey],
    mutationFn: updateReadTracker,
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const onRowClick = (row) => {
    const isSaleOrderRead = row?.readTracker?.sellerIsRead;

    if (isSaleOrderRead) {
      router.push(`/sales/sales-invoices/${row.id}`);
    } else {
      updateReadTrackerMutation.mutate(row.id);
      router.push(`/sales/sales-invoices/${row.id}`);
    }
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
  }, [filterData, enterpriseId, isInvoiceCreationSuccess, currentPage]);

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
  const invoiceColumns = useSalesInvoicesColumns(setSelectedInvoices);
  const debitNotesColumns = useDebitNotesColumns();

  // Function to trigger the download of a .xlsx file from Blob data
  const downloadBlobFile = (blobData, fileName) => {
    const el = document.createElement('a');
    const blobFile = window.URL.createObjectURL(blobData);
    el.href = blobFile;
    el.download = fileName;
    el.click();

    // Clean up the object URL after the download is triggered
    window.URL.revokeObjectURL(blobFile);
  };

  // export invoice mutation
  const exportInvoiceMutation = useMutation({
    mutationKey: [invoiceApi.exportInvoice.endpointKey],
    mutationFn: exportInvoice,
    onSuccess: (response) => {
      const blobData = response.data;
      downloadBlobFile(blobData, 'sales_invoices.xlsx');
      toast.success('Invoice exported and downloaded successfully');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // handle export order click
  const handleExportInvoice = () => {
    if (selectedInvoices.length === 0) {
      toast.error('Please select atleast One Invoice to export');
      return;
    }
    exportInvoiceMutation.mutate(selectedInvoices);
  };

  return (
    <>
      {!isCreatingInvoice && (
        <Wrapper>
          <SubHeader
            name={'Invoices'}
            className="sticky top-0 z-10 flex items-center justify-between bg-white"
          >
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={handleExportInvoice}
                variant="outline"
                className="border border-[#A5ABBD] hover:bg-neutral-600/10"
                size="sm"
              >
                <Upload size={14} />
              </Button>

              <Button
                onClick={() => setIsCreatingInvoice(true)}
                className="w-24 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
                size="sm"
              >
                <PlusCircle size={14} />
                Invoice
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
                    columns={debitNotesColumns}
                    onRowClick={onRowClick}
                    data={debitNotes}
                    filterData={filterData}
                    setFilterData={setFilterData}
                    paginationData={paginationData}
                  />
                )}

                {!getDebitNotesMutation.isPending &&
                  debitNotes?.length === 0 && (
                    <div className="flex h-[26rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                      <Image src={emptyImg} alt="emptyIcon" />
                      <p>No Debit Note Raised</p>
                    </div>
                  )}
              </TabsContent>
              <TabsContent value="creditNote">
                {getCreditNotesMutation.isPending && <Loading />}
                {!getCreditNotesMutation.isPending &&
                  creditNotes?.length > 0 && (
                    <DataTable
                      id={'sale-invoice-credits'}
                      columns={debitNotesColumns}
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
      )}

      {/* create invoice component */}
      {isCreatingInvoice && (
        <CreateOrder
          type="invoice"
          name="Invoice"
          cta="offer"
          isOrder="invoice"
          onCancel={() => setIsCreatingInvoice(false)}
          setIsOrderCreationSuccess={setIsInvoiceCreationSuccess}
        />
      )}
    </>
  );
};

export default SalesInvoices;
