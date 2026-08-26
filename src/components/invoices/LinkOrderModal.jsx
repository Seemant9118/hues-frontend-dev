'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import AsyncSelect from 'react-select/async';
import { toast } from 'sonner';
import {
  GetSales,
  OrderDetails,
} from '@/services/Orders_Services/Orders_Services';
import {
  getStylesForSelectComponent,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const LinkOrderModal = ({
  isOpen,
  onOpenChange,
  enterpriseId,
  order,
  setOrder,
  clientOptions = [],
  draftKey = 'b2bInvoiceDraft',
}) => {
  const translations = useTranslations('components.create_edit_order');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border border-neutral-100 bg-white p-6 shadow-lg">
        <DialogHeader className="gap-1 text-left">
          <DialogTitle className="text-lg font-bold text-neutral-800">
            Link Active Sales Order
          </DialogTitle>
          <DialogDescription className="text-neutral-450 text-xs font-medium">
            Search and select an active order (status: ACCEPTED) to link its
            items and client details to this invoice.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Search Order
            </label>
            <AsyncSelect
              cacheOptions
              defaultOptions={false}
              name="linkedOrder"
              placeholder={translations(
                'form.input.linked_with_order.placeholder',
              )}
              loadOptions={(inputValue) =>
                new Promise((resolve) => {
                  if (inputValue.length < 3) {
                    resolve([]);
                    return;
                  }
                  if (window.searchOrderTimeout)
                    clearTimeout(window.searchOrderTimeout);
                  window.searchOrderTimeout = setTimeout(async () => {
                    try {
                      const response = await GetSales({
                        id: enterpriseId,
                        data: {
                          page: 1,
                          limit: 10,
                          searchString: inputValue,
                          status: ['ACCEPTED'],
                        },
                      });
                      const ordersData = response?.data?.data?.data || [];
                      resolve(
                        ordersData.map((orderItem) => ({
                          value: orderItem.id,
                          label:
                            orderItem.referenceNumber ||
                            `Order #${orderItem.id}`,
                          originalData: orderItem,
                        })),
                      );
                    } catch (e) {
                      resolve([]);
                    }
                  }, 500);
                })
              }
              styles={getStylesForSelectComponent()}
              className="text-sm font-medium"
              classNamePrefix="select"
              value={order.selectedOrder || null}
              onChange={async (selectedOption) => {
                let prependedItems = order.orderItems || [];
                let prependedClientData = {};
                let prependedItemTypeData = {};

                if (selectedOption?.value) {
                  try {
                    const detailsRes = await OrderDetails(selectedOption.value);
                    const orderData = detailsRes?.data?.data;
                    if (orderData) {
                      if (orderData.orderItems) {
                        const formattedOrderItems = orderData.orderItems.map(
                          (item) => {
                            const pName =
                              item.productType === 'GOODS'
                                ? item.productDetails?.productName
                                : item.productDetails?.serviceName;
                            return {
                              ...item,
                              productName:
                                pName || item.productName || 'Unknown Item',
                              serviceName: pName || item.serviceName,
                              isFromLinkedOrder: true,
                            };
                          },
                        );

                        const manualItems = prependedItems.filter(
                          (i) => !i.isFromLinkedOrder,
                        );
                        prependedItems = [
                          ...formattedOrderItems,
                          ...manualItems,
                        ];
                      }

                      if (orderData.buyerId) {
                        const matchedClient = clientOptions?.find(
                          (opt) => opt.value === orderData.buyerId,
                        );
                        if (matchedClient) {
                          prependedClientData = {
                            buyerId: matchedClient.value,
                            selectedValue: matchedClient,
                            buyerType: matchedClient.isEnterpriseActive
                              ? 'ENTERPRISE'
                              : 'UNCONFIRMED_ENTERPRISE',
                            getAddressRelatedData: {
                              clientId: matchedClient.clientId,
                              clientEnterpriseId:
                                matchedClient.clientEnterpriseId,
                            },
                          };
                        }
                      }

                      const apiItemType =
                        orderData.invoiceType || orderData.orderType;
                      if (
                        apiItemType === 'GOODS' ||
                        apiItemType === 'SERVICE'
                      ) {
                        prependedItemTypeData = {
                          invoiceType: apiItemType,
                        };
                      }
                    }
                  } catch (error) {
                    toast.error('Error fetching order details');
                  }
                } else {
                  prependedItems = prependedItems.filter(
                    (i) => !i.isFromLinkedOrder,
                  );
                }

                const updatedOrder = {
                  ...order,
                  ...prependedClientData,
                  ...prependedItemTypeData,
                  orderId: selectedOption?.value || null,
                  selectedOrder: selectedOption || null,
                  orderItems: prependedItems,
                };

                setOrder(updatedOrder);
                saveDraftToSession({
                  key: draftKey,
                  data: updatedOrder,
                });
                onOpenChange(false);
              }}
              noOptionsMessage={() => 'Type at least 3 characters'}
              components={{
                DropdownIndicator: () => null,
                ClearIndicator: () => null,
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkOrderModal;
