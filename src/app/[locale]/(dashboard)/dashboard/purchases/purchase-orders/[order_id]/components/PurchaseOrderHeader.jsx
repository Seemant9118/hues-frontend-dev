import React from 'react';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import ActionsDropdown from '@/components/deliveryManagement/ActionsDropdown';
import SaveToExternalResource from '@/components/shared/SaveToExternalResource';

const PurchaseOrderHeader = ({
  params,
  purchaseOrdersBreadCrumbs,
  setIsNegotiation,
  setIsPastInvoices,
  orderDetails,
  ctaList,
  orderAttachments,
}) => {
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

  return (
    <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2 pb-4 backdrop-blur-md">
      <div className="flex flex-col gap-2 pt-2">
        {/* breadcrumbs */}
        <OrderBreadCrumbs
          possiblePagesBreadcrumbs={purchaseOrdersBreadCrumbs}
          setIsNegotiation={setIsNegotiation}
          setIsPastInvoices={setIsPastInvoices}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Dynamic CTAs */}
        <div className="flex items-center gap-2 max-sm:hidden">
          <SaveToExternalResource attachments={combinedAttachments} />
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
                          cta.className || 'flex items-center gap-1 font-bold'
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
                    className={cta.className || 'flex items-center gap-1'}
                  >
                    {cta.icon}
                    {cta.label}
                  </Button>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default PurchaseOrderHeader;
