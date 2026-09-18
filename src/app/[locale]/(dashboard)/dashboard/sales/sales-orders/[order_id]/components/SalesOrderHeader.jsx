import ActionsDropdown from '@/components/deliveryManagement/ActionsDropdown';
import ExternalStorageAuthModal from '@/components/Modals/ExternalStorageAuthModal';
import GoogleDriveAttachmentsModal from '@/components/Modals/GoogleDriveAttachmentsModal';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { HardDriveUpload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const SalesOrderHeader = ({
  params,
  viewNegotiationHistory,
  isGenerateInvoice,
  isRecordingPayment,
  isEditingOrder,
  isEditingServiceOrder,
  isNegotiation,
  isNegotiateOnBehalf,
  ctaList,
  orderDetails,
  orderAttachments,
}) => {
  const translations = useTranslations('sales.sales-orders.order_details');

  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { isConnected, connect, bulkUpload, isBulkUploading } =
    useGoogleDrive();

  // Combine all possible attachments
  const combinedAttachments = [
    {
      isModuleDocument: true,
      documentType: 'order',
      id: parseInt(params.order_id, 10),
      documentName: orderDetails?.referenceNumber || 'Order PDF',
    },
    ...(orderAttachments || []),
  ];

  const handleDriveClick = () => {
    if (!isConnected) {
      setIsAuthModalOpen(true);
    } else {
      setIsDriveModalOpen(true);
    }
  };

  const handleAuthorize = () => {
    setIsAuthModalOpen(false);
    connect(); // Redirects to settings
  };

  const handleSaveAttachments = async (selectedAttachments) => {
    const s3Urls = [];
    const documents = [];

    selectedAttachments.forEach((att) => {
      if (att.isModuleDocument) {
        documents.push({
          documentType: att.documentType,
          ids: [att.id],
        });
      } else if (att.documentUrl) {
        s3Urls.push(att.documentUrl);
      }
    });

    const payload = {
      provider: 'google_drive',
    };
    if (s3Urls.length > 0) payload.s3_urls = s3Urls;
    if (documents.length > 0) payload.documents = documents;

    return bulkUpload(payload);
  };

  const salesOrdersBreadCrumbs = [
    {
      id: 1,
      name: translations('title.sales'),
      path: '/dashboard/sales/sales-orders',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title.order_details'),
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: true, // Always show
    },
    {
      id: 3,
      name: isNegotiateOnBehalf
        ? 'Negotiate on Behalf'
        : translations('title.negotiation'),
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: isNegotiation, // Show only if isNegotiation is true
    },
    {
      id: 4,
      name: translations('title.generate_invoice'),
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: isGenerateInvoice, // Show only if isGenerateInvoice is true
    },
    {
      id: 5,
      name: translations('title.record_payment'),
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: isRecordingPayment, // Show only if isGenerateInvoice is true
    },
    {
      id: 6,
      name: 'Negotiation History',
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: viewNegotiationHistory, // Show only if viewNegotiatioHistory is true
    },
    {
      id: 7,
      name: 'Edit Order',
      path: `/dashboard/sales/sales-orders/${params.order_id}`,
      show: isEditingOrder || isEditingServiceOrder, // Show only if isEditingOrder is true
    },
  ];

  return (
    <section className={`sticky -top-4 z-40 py-2 pb-4 backdrop-blur-md`}>
      <div className="flex w-full items-start justify-between sm:items-center">
        {/* title */}
        <OrderBreadCrumbs
          type={'order'}
          possiblePagesBreadcrumbs={salesOrdersBreadCrumbs}
        />

        {/* Dynamic CTAs */}
        <div className="flex items-center gap-2 max-sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDriveClick}
            className="flex items-center gap-2 font-bold text-gray-700"
          >
            <HardDriveUpload size={16} />
            Save to external resource
          </Button>

          {ctaList.filter((cta) => cta.isHeader).length > 0 &&
            ctaList
              .filter((cta) => cta.isHeader)
              .map((cta) => {
                if (cta.isHide) return null;
                if (cta.isDropdown) {
                  const visibleActions = (cta.actions || []).filter(
                    (action) => !!action && !action.isHide,
                  );
                  if (visibleActions.length === 0) return null;
                  if (visibleActions.length === 1) {
                    const singleAction = visibleActions[0];
                    const ActionIcon = singleAction.icon;
                    return (
                      <Button
                        key={singleAction.key || singleAction.label}
                        size="sm"
                        variant={cta.variant || 'default'}
                        onClick={singleAction.onClick}
                        disabled={singleAction.disabled || cta.disabled}
                        className={
                          cta.className || 'item-center flex gap-1 font-bold'
                        }
                      >
                        {ActionIcon && <ActionIcon size={14} />}
                        {singleAction.label}
                      </Button>
                    );
                  }
                  return (
                    <ActionsDropdown
                      key={cta.label}
                      label={cta.label}
                      variant={cta.variant}
                      disabled={cta.disabled}
                      actions={visibleActions}
                      isThreeDots={cta.isThreeDots}
                      isHide={cta.isHide}
                    />
                  );
                }
                return (
                  <Button
                    key={cta.label}
                    size="sm"
                    variant={cta.variant || 'default'}
                    onClick={cta.onClick}
                    disabled={cta.disabled}
                    className={cta.className || 'item-center flex gap-1'}
                  >
                    {cta.icon}
                    {cta.label}
                  </Button>
                );
              })}
        </div>
      </div>

      <GoogleDriveAttachmentsModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        attachments={combinedAttachments}
        onSave={handleSaveAttachments}
        isSaving={isBulkUploading}
      />
      <ExternalStorageAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthorize={handleAuthorize}
      />
    </section>
  );
};

export default SalesOrderHeader;
