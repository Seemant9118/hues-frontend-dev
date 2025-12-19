'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import CommentBox from '@/components/comments/CommentBox';
import DeliveryAttachments from '@/components/deliveryManagement/DeliveryAttachements';
import { DeliveryResultDialog } from '@/components/deliveryManagement/DeliveryResultDialog';
import { ModifyPOD } from '@/components/deliveryManagement/ModifyPOD';
import PODActionsDropdown from '@/components/deliveryManagement/PODActionsDropdown';
import RejectReasonModal from '@/components/deliveryManagement/RejectReasonModal';
import PINVerifyModal from '@/components/invoices/PINVerifyModal';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  acceptPOD,
  getPODByID,
  previewPOD,
  rejectPOD,
} from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { viewPdfInNewTab } from '@/services/Template_Services/Template_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Eye, MoveUpRight, PencilLine, X } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { usePODColumnsItems } from './usePODColumnsItems';

const ViewPOD = () => {
  const translations = useTranslations('transport.pods.podsDetails');
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const [tabs, setTabs] = useState('overview');
  const [openModify, setOpenModify] = useState(false);
  const [type, setType] = useState('');
  const [isOpenPinVerifyModal, setIsOpenPinVerifyModal] = useState(false);
  const [isPINError, setIsPINError] = useState(false);
  const [deliveryResultType, setDeliveryResultType] = useState(null);
  const [openDeliveryResult, setOpenDeliveryResult] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [openRejectReasonModal, setOpenRejectReasonModal] = useState(false);
  const enterpriseId = getEnterpriseId();

  const podsBreadCrumbs = [
    {
      id: 1,
      name: translations('title1'),
      path: '/dashboard/transport/pod',
      show: true,
    },
    {
      id: 2,
      name: translations('title2'),
      path: `/dashboard/transport/pod/${params.id}`,
      show: true,
    },
  ];

  const onTabChange = (tab) => {
    setTabs(tab);
  };

  const { data: podDetails } = useQuery({
    queryKey: [deliveryProcess.getPODbyId.endpointKey],
    queryFn: () => getPODByID({ id: params.id }),
    select: (data) => data.data.data,
  });
  const isSeller = podDetails?.metaData?.sellerEnterpriseId === enterpriseId;

  // iamSeller -> show my vendorname
  const iamSeller = isSeller;
  const buyerName = podDetails?.metaData?.buyerDetails?.name;
  const sellerName = podDetails?.metaData?.sellerDetails?.name;

  const overviewData = {
    podId: podDetails?.referenceNumber || '-',
    vendorName: iamSeller ? buyerName : sellerName,
    podDate: podDetails?.createdAt
      ? moment(podDetails.createdAt).format('DD/MM/YYYY')
      : '-',
    status: podDetails?.status || '-',

    // Only for buyer (not seller)
    ...(!isSeller && {
      grnId: podDetails?.grn?.referenceNumber || '-',
      // grnDate: '-',
    }),

    deliveryId: podDetails?.voucherReferenceNumber || '-',
    invoiceId: podDetails?.metaData?.invoiceDetails?.referenceNumber || '-',
    EWB: podDetails?.metaData?.invoiceDetails?.eWayBillId || '-',
    attachements: '-',
  };

  const overviewLabels = {
    podId: translations('overview_labels.podId'),
    ...(!isSeller
      ? { vendorName: translations('overview_labels.vendorName') }
      : { vendorName: translations('overview_labels.clientName') }),
    podDate: translations('overview_labels.podDate'),
    status: translations('overview_labels.status'),

    // Only for buyer (not seller)
    ...(!isSeller && {
      grnId: translations('overview_labels.grnId'),
      // grnDate: translations('overview_labels.grnDate'),
    }),

    deliveryId: translations('overview_labels.deliveryId'),
    invoiceId: translations('overview_labels.invoiceId'),
    EWB: translations('overview_labels.EWB'),
    attachements: translations('overview_labels.attachements'),
  };

  const customRender = {
    grnId: () => {
      const grnId = podDetails?.grn?.id;
      const grnRef = podDetails?.grn?.referenceNumber;

      return (
        <p
          className={`flex items-center gap-1 ${
            grnId
              ? 'cursor-pointer hover:text-primary hover:underline'
              : 'cursor-default text-muted-foreground'
          }`}
          onClick={() => {
            if (grnId) {
              router.push(`/dashboard/transport/grn/${grnId}`);
            }
          }}
        >
          {grnRef ? (
            <>
              {grnRef}
              <MoveUpRight size={14} />
            </>
          ) : (
            '--'
          )}
        </p>
      );
    },
    deliveryId: () => {
      return (
        <p
          className="flex cursor-pointer items-center gap-1 hover:text-primary hover:underline"
          onClick={() =>
            router.push(
              `/dashboard/transport/delivery-challan/${podDetails?.voucherId}`,
            )
          }
        >
          {podDetails?.voucherReferenceNumber} <MoveUpRight size={14} />
        </p>
      );
    },
    invoiceId: () => {
      const invoice = podDetails?.metaData?.invoiceDetails;

      if (!invoice?.id || !invoice?.referenceNumber) return '-';

      const path = isSeller
        ? `/dashboard/sales/sales-invoices/${invoice.id}`
        : `/dashboard/purchases/purchase-invoices/${invoice.id}`;

      return (
        <p
          className="flex cursor-pointer items-center gap-1 hover:text-primary hover:underline"
          onClick={() => router.push(path)}
        >
          {invoice.referenceNumber}
          <MoveUpRight size={14} />
        </p>
      );
    },
    attachements: () => (
      <DeliveryAttachments attachments={podDetails?.proofOfDeliveryImages} />
    ),
  };

  const previewPODMutation = useMutation({
    mutationFn: previewPOD,
    onSuccess: async (data) => {
      toast.success('Document Generated Successfully');
      const pdfSlug = data?.data?.data?.podDocumentSlug;

      viewPdfInNewTab(pdfSlug);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handlePreview = () => {
    if (podDetails?.documentLink) {
      viewPdfInNewTab(podDetails?.documentLink);
    } else {
      previewPODMutation.mutate({
        id: params.id,
      });
    }
  };

  const acceptPODMutation = useMutation({
    mutationFn: acceptPOD,
    onSuccess: (data) => {
      setIsOpenPinVerifyModal(false);
      toast.success('PIN verified & POD accepted');

      router.push(`/dashboard/transport/grn/${data?.data?.data?.grn?.id}`);

      setDeliveryResultType('ACCEPTED');
      setOpenDeliveryResult(true);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
      setIsPINError(true);
    },
  });

  const rejectPODMutation = useMutation({
    mutationFn: rejectPOD,
    onSuccess: () => {
      setIsOpenPinVerifyModal(false);
      toast.success('PIN verified & POD rejected');

      queryClient.invalidateQueries([deliveryProcess.getPODbyId.endpoint]);

      setDeliveryResultType('REJECTED');
      setOpenDeliveryResult(true);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
      setIsPINError(true);
    },
  });

  const handleAcceptOrRejectPODs = (data) => {
    if (type === 'ACCEPTED') {
      const payload = {
        podId: params?.id,
        data: {
          type: data.type,
          pin: data.pin,
        },
      };
      acceptPODMutation.mutate(payload);
      // eslint-disable-next-line no-useless-return
      return;
    } else {
      const payload = {
        podId: params?.id,
        data: {
          type: data.type,
          pin: data.pin,
          rejectionReason: rejectReason,
        },
      };

      rejectPODMutation.mutate(payload);
      // eslint-disable-next-line no-useless-return
      return;
    }
  };

  const podsColumns = usePODColumnsItems();

  return (
    <Wrapper className="h-full py-2">
      {/* Header */}
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <OrderBreadCrumbs possiblePagesBreadcrumbs={podsBreadCrumbs} />

        {/* preview */}
        <Tooltips
          trigger={
            <Button
              onClick={handlePreview}
              size="sm"
              variant="outline"
              className="font-bold"
            >
              <Eye size={14} />
            </Button>
          }
          content={'Preview PoD Document'}
        />
      </section>

      <Tabs value={tabs} onValueChange={onTabChange} defaultValue={'overview'}>
        <section className="flex items-center justify-between gap-2">
          <TabsList className="border">
            <TabsTrigger value="overview">
              {translations('tabs.tab1.title')}
            </TabsTrigger>
          </TabsList>
          {/* ctas */}
          {!isSeller && podDetails?.status === 'PENDING' && (
            <PODActionsDropdown
              disabled={
                acceptPODMutation.isLoading || rejectPODMutation.isLoading
              }
              actions={[
                {
                  key: 'accept',
                  label: 'Accept as Delivered',
                  icon: CheckCircle,
                  className: 'text-green-600',
                  onClick: () => {
                    setType('ACCEPTED');
                    setIsOpenPinVerifyModal(true);
                  },
                },
                {
                  key: 'modify',
                  label: 'Modify & Accept',
                  icon: PencilLine,
                  onClick: () => {
                    setOpenModify(true);
                  },
                },
                {
                  key: 'reject',
                  label: 'Reject Delivery',
                  icon: X,
                  className: 'text-red-600',
                  onClick: () => {
                    setType('REJECTED');
                    setOpenRejectReasonModal(true);
                  },
                },
              ]}
            />
          )}

          {isSeller && podDetails?.status === 'PENDING' && (
            <PODActionsDropdown
              disabled={
                acceptPODMutation.isLoading || rejectPODMutation.isLoading
              }
              actions={[
                {
                  key: 'markedAsRecieved',
                  label: 'Marked as Recieved',
                  icon: CheckCircle,
                  className: 'text-green-600',
                  onClick: () => {
                    setOpenModify(true);
                  },
                },
              ]}
            />
          )}
        </section>
        <TabsContent value="overview" className="flex h-full flex-col">
          {/* OVERVIEW SECTION */}
          <Overview
            collapsible={false}
            data={overviewData}
            labelMap={overviewLabels}
            customRender={customRender}
            isSeller={isSeller}
            isPOD={true}
          />

          <CommentBox contextId={params.id} context={'POD'} />

          {/* Table + CTA Wrapper */}
          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            {/* Scrollable table area */}
            <div className="flex-1 overflow-auto">
              <DataTable
                id="pods"
                columns={podsColumns}
                data={podDetails?.id ? podDetails?.items : []}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {openModify && (
        <ModifyPOD
          open={openModify}
          onOpenChange={() => setOpenModify(false)}
          data={podDetails?.items}
          podId={params?.id}
          type={isSeller ? 'MARK_AS_DELIVERED' : 'MODIFY_AND_ACCEPT'}
        />
      )}
      {/* Reject Reason Modal */}
      {openRejectReasonModal && (
        <RejectReasonModal
          open={openRejectReasonModal}
          setOpen={setOpenRejectReasonModal}
          onConfirm={(reason) => {
            setRejectReason(reason);
            setIsOpenPinVerifyModal(true);
          }}
        />
      )}

      {/* PIN Verification Modal */}
      {isOpenPinVerifyModal && (
        <PINVerifyModal
          open={isOpenPinVerifyModal}
          setOpen={setIsOpenPinVerifyModal}
          order={{ type }}
          handleCreateFn={(data) => handleAcceptOrRejectPODs(data)}
          isPINError={isPINError}
          setIsPINError={setIsPINError}
        />
      )}

      {/* Result Dialog */}
      <DeliveryResultDialog
        open={openDeliveryResult}
        type={deliveryResultType}
        onClose={() => {
          setOpenDeliveryResult(false);
          setDeliveryResultType(null);
        }}
        id={params?.id}
      />
    </Wrapper>
  );
};

export default ViewPOD;
