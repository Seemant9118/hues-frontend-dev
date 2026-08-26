import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import ReactSelect from 'react-select';
import {
  getStylesForSelectComponent,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';
import { Input } from '@/components/ui/input';
import { createClient } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import AddModal from '@/components/Modals/AddModal';
import DatePickers from '@/components/ui/DatePickers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LinkOrderModal from '@/components/invoices/LinkOrderModal';

export default function B2BInvoiceDetailsSection({
  fields,
  handleSetFields,
  order,
  setOrder,
  setSelectedItem,
  baseVersion,
  etag,
  originalCustomFields,
  originalSystemFields,
  revision,
  handleSaveSuccess,
  errorMsg,
  setErrorMsg,
  translations,
  clientOptions,
  itemTypeOptions,
  enterpriseId,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  return (
    <div className="flex-shrink-0">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
        Invoice Details
      </span>
      <section className="border-b bg-white p-5 shadow-none">
        <DynamicFormRenderer
          module="SALES_B2BINVOICE"
          fields={fields}
          setFields={handleSetFields}
          formData={order}
          allowAddField={false}
          baseVersion={baseVersion}
          etag={etag}
          originalCustomFields={originalCustomFields}
          originalSystemFields={originalSystemFields}
          revision={revision}
          onSaveSuccess={handleSaveSuccess}
          filterFn={(f) => {
            const detailKeys = [
              'invoiceDate',
              'source',
              'invoiceReferenceNumber',
              'buyerId',
              'invoiceType',
              'orderId',
            ];
            return f.kind === 'SYSTEM' && detailKeys.includes(f.key);
          }}
          gridCols="grid-cols-1 md:grid-cols-3"
          onChange={(key, value) => {
            const updatedOrder = {
              ...order,
              [key]: value,
            };
            if (key === 'source' && value === 'hues') {
              updatedOrder.invoiceReferenceNumber = null;
            }
            setOrder(updatedOrder);
            saveDraftToSession({
              key: 'b2bInvoiceDraft',
              data: updatedOrder,
            });

            if (errorMsg[key]) {
              setErrorMsg((prev) => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
              });
            }
          }}
          errors={errorMsg}
          renderCustomField={(field) => {
            if (field.key === 'invoiceDate') {
              return (
                <div className="relative flex h-10 items-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                  <DatePickers
                    selected={
                      order.invoiceDate ? new Date(order.invoiceDate) : null
                    }
                    onChange={(date) => {
                      const formattedForAPI = date ? date.toISOString() : null;

                      const updatedOrder = {
                        ...order,
                        invoiceDate: formattedForAPI,
                      };
                      setOrder(updatedOrder);

                      saveDraftToSession({
                        key: 'b2bInvoiceDraft',
                        data: updatedOrder,
                      });

                      if (errorMsg?.invoiceDate) {
                        setErrorMsg((prev) => ({
                          ...prev,
                          invoiceDate: '',
                        }));
                      }
                    }}
                    popperPlacement="end"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    className="w-full bg-transparent pr-8 text-sm font-medium text-neutral-700 outline-none"
                  />
                  <Calendar
                    className="pointer-events-none absolute right-3 text-neutral-400"
                    size={16}
                  />
                </div>
              );
            }
            if (field.key === 'source') {
              return (
                <Select
                  value={order.source}
                  onValueChange={(value) => {
                    const updatedOrder = {
                      ...order,
                      source: value,
                      ...(value === 'hues' && {
                        invoiceReferenceNumber: null,
                      }),
                    };
                    setOrder(updatedOrder);

                    saveDraftToSession({
                      key: 'b2bInvoiceDraft',
                      data: updatedOrder,
                    });

                    if (errorMsg?.source) {
                      setErrorMsg((prev) => ({
                        ...prev,
                        source: '',
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="h-10 rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/20">
                    <SelectValue
                      placeholder={translations(
                        'form.input.source.placeholder',
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border border-neutral-100 bg-white shadow-md">
                    <SelectItem value="hues">Hues</SelectItem>
                    <SelectItem value="tally">Tally</SelectItem>
                    <SelectItem value="other">Other ERP</SelectItem>
                  </SelectContent>
                </Select>
              );
            }
            if (field.key === 'invoiceReferenceNumber') {
              return (
                <Input
                  type="text"
                  disabled={order.source === 'hues'}
                  className={`h-10 w-full rounded-lg border-neutral-200 text-sm font-medium shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 ${
                    order.source === 'hues'
                      ? 'cursor-not-allowed border-dashed bg-neutral-50 text-neutral-400'
                      : 'bg-white text-neutral-700'
                  }`}
                  placeholder={
                    order.source === 'hues'
                      ? 'Not applicable for Hues'
                      : translations('form.input.reference_number.placeholder')
                  }
                  value={
                    order.source === 'hues'
                      ? 'N/A'
                      : order.invoiceReferenceNumber || ''
                  }
                  onChange={(e) => {
                    if (order.source === 'hues') return;
                    const updatedOrder = {
                      ...order,
                      invoiceReferenceNumber: e.target.value,
                    };
                    setOrder(updatedOrder);
                    saveDraftToSession({
                      key: 'b2bInvoiceDraft',
                      data: updatedOrder,
                    });

                    if (errorMsg?.invoiceReferenceNumber) {
                      setErrorMsg((prev) => ({
                        ...prev,
                        invoiceReferenceNumber: '',
                      }));
                    }
                  }}
                />
              );
            }
            if (field.key === 'buyerId') {
              return (
                <div className="flex w-full flex-col gap-1">
                  <ReactSelect
                    name="clients"
                    placeholder={translations('form.input.client.placeholder')}
                    options={clientOptions}
                    styles={getStylesForSelectComponent()}
                    className="text-sm font-medium"
                    classNamePrefix="select"
                    value={
                      clientOptions?.find(
                        (option) => option.value === order?.buyerId,
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      if (!selectedOption) return;

                      const {
                        value: id,
                        clientId,
                        clientEnterpriseId,
                        isEnterpriseActive,
                      } = selectedOption;

                      if (id === 'add-new-client') {
                        setIsModalOpen(true);
                        return;
                      }

                      const updatedOrder = {
                        ...order,
                        buyerId: id,
                        selectedValue: selectedOption,
                        buyerType: isEnterpriseActive
                          ? 'ENTERPRISE'
                          : 'UNCONFIRMED_ENTERPRISE',
                        getAddressRelatedData: {
                          clientId,
                          clientEnterpriseId,
                        },
                        orderItems: [],
                      };

                      setOrder(updatedOrder);
                      saveDraftToSession({
                        key: 'b2bInvoiceDraft',
                        data: updatedOrder,
                      });

                      if (errorMsg?.buyerId) {
                        setErrorMsg((prev) => ({
                          ...prev,
                          buyerId: '',
                        }));
                      }
                    }}
                  />
                  {isModalOpen && (
                    <AddModal
                      type="Add"
                      cta="client"
                      btnName="Add a new Client"
                      mutationFunc={createClient}
                      isOpen={isModalOpen}
                      setIsOpen={setIsModalOpen}
                    />
                  )}
                </div>
              );
            }
            if (field.key === 'invoiceType') {
              return (
                <ReactSelect
                  name="itemType"
                  placeholder={translations('form.input.item_type.placeholder')}
                  options={itemTypeOptions}
                  styles={getStylesForSelectComponent()}
                  className="text-sm font-medium"
                  classNamePrefix="select"
                  value={
                    itemTypeOptions?.find(
                      (option) => option.value === order.invoiceType,
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    if (!selectedOption) return;

                    const clearedItem = {
                      productName: '',
                      productType: '',
                      hsnCode: '',
                      sac: '',
                      serviceName: '',
                      productId: null,
                      quantity: null,
                      unitId: null,
                      unitPrice: null,
                      gstPerUnit: 0,
                      totalAmount: null,
                      totalGstAmount: null,
                      batch: null,
                      batches: [],
                      expiryDate: '',
                    };

                    setSelectedItem(clearedItem);

                    const updatedOrder = {
                      ...order,
                      invoiceType: selectedOption.value,
                      orderItems: [],
                    };

                    setOrder(updatedOrder);

                    saveDraftToSession({
                      key: 'b2bInvoiceDraft',
                      data: {
                        ...updatedOrder,
                        itemDraft: clearedItem,
                      },
                    });

                    if (errorMsg?.invoiceType) {
                      setErrorMsg((prev) => ({
                        ...prev,
                        invoiceType: '',
                      }));
                    }
                  }}
                />
              );
            }
            if (field.key === 'orderId') {
              return (
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={!order.buyerId || !order.invoiceType}
                    onClick={() => setIsOrderModalOpen(true)}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50/50 text-sm font-semibold text-neutral-600 shadow-sm transition-all hover:border-primary hover:bg-neutral-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus
                      size={16}
                      className="text-neutral-400 transition-colors"
                    />
                    <span>
                      {order.orderId
                        ? `Linked Order ID: #${order.orderId}`
                        : 'Link an Active Order'}
                    </span>
                  </button>
                </div>
              );
            }
            return null;
          }}
        />

        {isOrderModalOpen && (
          <LinkOrderModal
            isOpen={isOrderModalOpen}
            onOpenChange={setIsOrderModalOpen}
            enterpriseId={enterpriseId}
            order={order}
            setOrder={setOrder}
            clientOptions={clientOptions}
            draftKey="b2bInvoiceDraft"
          />
        )}
      </section>
    </div>
  );
}
