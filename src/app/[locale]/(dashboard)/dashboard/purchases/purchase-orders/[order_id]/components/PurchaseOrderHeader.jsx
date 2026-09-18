import React from 'react';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import Tooltips from '@/components/auth/Tooltips';
import { Button } from '@/components/ui/button';
import ActionsDropdown from '@/components/deliveryManagement/ActionsDropdown';
import { Eye } from 'lucide-react';
import { viewOrderinNewTab } from '@/services/Orders_Services/Orders_Services';
import { useTranslations } from 'next-intl';

const PurchaseOrderHeader = ({
  params,
  purchaseOrdersBreadCrumbs,
  setIsNegotiation,
  setIsPastInvoices,
  isPaymentAdvicing,
  isNegotiation,
  viewNegotiationHistory,
  orderDetails,
  ctaList,
}) => {
  const translations = useTranslations(
    'purchases.purchase-orders.order_details',
  );

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

      <div className="flex gap-1">
        {/* view CTA */}
        {!isPaymentAdvicing &&
          !isNegotiation &&
          !viewNegotiationHistory &&
          orderDetails?.negotiationStatus !== 'WITHDRAWN' && (
            <Tooltips
              trigger={
                <Button
                  onClick={() => viewOrderinNewTab(params.order_id)}
                  size="sm"
                  variant="outline"
                  className="font-bold"
                  title="Preview Order"
                >
                  <Eye size={14} className="text-primary" />
                </Button>
              }
              content={translations('ctas.view.placeholder')}
            />
          )}

        {/* Dynamic CTAs */}
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
    </section>
  );
};

export default PurchaseOrderHeader;
