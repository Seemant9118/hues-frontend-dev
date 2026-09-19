import ActionsCard from '@/components/shared/ActionsCard';
import CommentBox from '@/components/comments/CommentBox';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import TimelineItem from '@/components/ui/TimelineItem';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import dynamic from 'next/dynamic';
import { viewOrderinNewTab } from '@/services/Orders_Services/Orders_Services';
import DocumentsAttachmentsSection from '@/components/shared/DocumentsAttachmentsSection';
import { useSalesOrderColumns } from '../useSalesOrderColumns';

const OrdersOverview = dynamic(
  () => import('@/components/orders/OrdersOverview'),
  { ssr: false },
);

const PastInvoices = dynamic(
  () => import('@/components/invoices/PastInvoices'),
  {
    ssr: false,
  },
);

const PaymentDetails = dynamic(
  () => import('@/components/payments/PaymentDetails'),
  {
    ssr: false,
  },
);

const SalesOrderTabs = ({
  tab,
  onTabChange,
  translations,
  customFormsGroups,
  hasAnyActions,
  orderDetails,
  multiStatus,
  invitationData,
  setViewNegotiationHistory,
  params,
  recommendedActions,
  ancillaryActions,
  cancelAction,
  orderAttachments,
  isTimeLinesDataLoading,
  timeLineData,
  setIsRecordingPayment,
}) => {
  const columns = useSalesOrderColumns(orderDetails?.negotiationStatus);

  const renderAttachments = () => {
    return (
      <DocumentsAttachmentsSection
        mainDocument={{
          name: orderDetails?.referenceNumber || 'Order PDF',
          onClick: () => viewOrderinNewTab(params.order_id),
        }}
        attachments={orderAttachments}
      />
    );
  };

  return (
    <section>
      <Tabs value={tab} onValueChange={onTabChange} defaultValue={'overview'}>
        <section className="sticky top-12 bg-white">
          <TabsList className="border">
            <TabsTrigger
              className={`${tab === 'overview' ? 'shadow-customShadow' : ''}`}
              value="overview"
            >
              {translations('tabs.label.tab1')}
            </TabsTrigger>
            <TabsTrigger
              className={`${tab === 'invoices' ? 'shadow-customShadow' : ''}`}
              value="invoices"
            >
              {translations('tabs.label.tab2')}
            </TabsTrigger>
            <TabsTrigger
              className={`${tab === 'payment' ? 'shadow-customShadow' : ''}`}
              value="payment"
            >
              {translations('tabs.label.tab3')}
            </TabsTrigger>
            {customFormsGroups.map((group) => (
              <TabsTrigger
                key={`trigger-${group.formId}`}
                className={`${tab === `custom-${group.formId}` ? 'shadow-customShadow' : ''}`}
                value={`custom-${group.formId}`}
              >
                {group.formName}
              </TabsTrigger>
            ))}
            <TabsTrigger
              className={`${tab === 'timeline' ? 'shadow-customShadow' : ''}`}
              value="timeline"
            >
              {translations('tabs.label.tab4')}
            </TabsTrigger>
          </TabsList>
        </section>

        <TabsContent value="overview" className="flex flex-col gap-2">
          {hasAnyActions ? (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2 lg:col-span-2">
                  <OrdersOverview
                    isCollapsableOverview={false}
                    orderDetails={orderDetails}
                    orderId={orderDetails?.referenceNumber}
                    multiStatus={multiStatus}
                    Name={orderDetails?.clientName}
                    mobileNumber={orderDetails?.mobileNumber}
                    amtPaid={orderDetails?.amountPaid}
                    totalAmount={
                      (orderDetails?.amount || 0) +
                      (orderDetails?.gstAmount || 0)
                    }
                    invitationData={invitationData}
                    setViewNegotiationHistory={setViewNegotiationHistory}
                  />

                  {renderAttachments()}
                  <CommentBox contextId={params.order_id} context={'ORDER'} />
                </div>

                <div className="lg:col-span-1">
                  <ActionsCard
                    recommendedActions={recommendedActions}
                    ancillaryActions={ancillaryActions}
                    cancelAction={cancelAction}
                  />
                </div>
              </div>

              <DataTable
                columns={columns}
                data={orderDetails?.orderItems || []}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <OrdersOverview
                isCollapsableOverview={false}
                orderDetails={orderDetails}
                orderId={orderDetails?.referenceNumber}
                multiStatus={multiStatus}
                Name={orderDetails?.clientName}
                mobileNumber={orderDetails?.mobileNumber}
                amtPaid={orderDetails?.amountPaid}
                totalAmount={
                  (orderDetails?.amount || 0) + (orderDetails?.gstAmount || 0)
                }
                invitationData={invitationData}
                setViewNegotiationHistory={setViewNegotiationHistory}
              />

              {renderAttachments()}
              <CommentBox contextId={params.order_id} context={'ORDER'} />
              <DataTable
                columns={columns}
                data={orderDetails?.orderItems || []}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices">
          <PastInvoices
            invoiceType="sales_invoice"
            id={params?.order_id}
            orderDetails={orderDetails}
          />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentDetails
            orderId={params?.order_id}
            orderDetails={orderDetails}
            setIsRecordingPayment={setIsRecordingPayment}
          />
        </TabsContent>

        {customFormsGroups.map((group) => {
          const columns = group.fields.map((field) => ({
            accessorKey: field.key,
            header: field.label,
            cell: ({ row }) => {
              const val = row.original[field.key];
              return (
                <div
                  className="max-w-[200px] truncate"
                  title={String(val || '')}
                >
                  {String(val || '-')}
                </div>
              );
            },
          }));
          return (
            <TabsContent
              key={`content-${group.formId}`}
              value={`custom-${group.formId}`}
            >
              <div className="rounded-xl border bg-white p-4">
                <h3 className="mb-4 font-bold">{group.formName}</h3>
                <DataTable columns={columns} data={group.data} />
              </div>
            </TabsContent>
          );
        })}

        <TabsContent value="timeline">
          <div className="h-full w-full animate-fadeInUp overflow-auto p-2">
            {isTimeLinesDataLoading && <Loading />}
            {!isTimeLinesDataLoading &&
              timeLineData?.length > 0 &&
              timeLineData?.map((timeLinetItem, index) => (
                <TimelineItem
                  key={timeLinetItem?.id}
                  title={timeLinetItem?.action}
                  dateTime={timeLinetItem?.createdAt}
                  isLast={index === timeLineData.length - 1}
                  action={timeLinetItem?.action}
                  module={timeLinetItem?.module}
                  details={timeLinetItem?.details}
                />
              ))}

            {!isTimeLinesDataLoading && timeLineData?.length === 0 && (
              <div>No Timeline recorded yet</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default SalesOrderTabs;
