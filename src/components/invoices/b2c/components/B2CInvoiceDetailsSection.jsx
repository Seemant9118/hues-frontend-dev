import { Calendar } from 'lucide-react';
import React from 'react';
import ReactSelect from 'react-select';
import CreatableSelect from 'react-select/creatable';
import {
  getStylesForSelectComponent,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';
import DatePickers from '@/components/ui/DatePickers';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function B2CInvoiceDetailsSection({
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
  inputValue,
  setInputValue,
  options,
  setOptions,
  addressTypesOptions,
  itemTypeOptions,
}) {
  const handleChange = (selectedOption) => {
    if (selectedOption) {
      const updatedOrder = {
        ...order,
        buyerId: selectedOption.value,
        buyerAddress: selectedOption.address || '',
        buyerName: selectedOption.name || '',
        addressType: 'deliveryPurchase',
      };
      setOrder(updatedOrder);
      saveDraftToSession({
        key: 'b2CInvoiceDraft',
        data: updatedOrder,
      });
    } else {
      const updatedOrder = {
        ...order,
        buyerId: null,
        buyerAddress: null,
        buyerName: null,
        addressType: null,
      };
      setOrder(updatedOrder);
      saveDraftToSession({
        key: 'b2CInvoiceDraft',
        data: updatedOrder,
      });
    }
  };

  const handleCreate = (newInputValue) => {
    const newOption = {
      value: newInputValue,
      label: newInputValue,
      name: null,
      address: null,
    };

    if (newInputValue?.length === 10) {
      setOptions((prev) => [...prev, newOption]);
      const updatedOrder = {
        ...order,
        buyerId: newInputValue,
        buyerName: null,
        buyerAddress: null,
        addressType: null,
      };
      setOrder(updatedOrder);
      saveDraftToSession({
        key: 'b2CInvoiceDraft',
        data: updatedOrder,
      });
    }
  };

  return (
    <div className="flex-shrink-0">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
        Invoice Details
      </span>
      <section className="border-b bg-white p-5 shadow-none">
        <DynamicFormRenderer
          module="B2CINVOICE"
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
              'buyerId',
              'buyerName',
              'addressType',
              'buyerAddress',
              'invoiceType',
            ];
            return f.kind === 'SYSTEM' && detailKeys.includes(f.key);
          }}
          gridCols="grid-cols-1 md:grid-cols-3"
          onChange={(key, value) => {
            const updatedOrder = {
              ...order,
              [key]: value,
            };
            setOrder(updatedOrder);
            saveDraftToSession({
              key: 'b2CInvoiceDraft',
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
                        key: 'b2CInvoiceDraft',
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
            if (field.key === 'buyerId') {
              return (
                <CreatableSelect
                  isClearable
                  name="buyerId"
                  options={options}
                  inputValue={inputValue}
                  onInputChange={(val) => setInputValue(val)}
                  onChange={handleChange}
                  onCreateOption={handleCreate}
                  value={
                    options.find((option) => option.value === order.buyerId) ||
                    (order.buyerId
                      ? { value: order.buyerId, label: order.buyerId }
                      : null)
                  }
                  styles={getStylesForSelectComponent()}
                  placeholder={translations('form.input.customer.placeholder')}
                  className="text-sm font-medium"
                  classNamePrefix="select"
                />
              );
            }
            if (field.key === 'buyerName') {
              return (
                <Input
                  type="text"
                  placeholder={translations(
                    'form.input.customer_name.placeholder',
                  )}
                  className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                  value={order.buyerName || ''}
                  onChange={(e) => {
                    const updatedOrder = {
                      ...order,
                      buyerName: e.target.value,
                    };
                    setOrder(updatedOrder);
                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: updatedOrder,
                    });

                    if (errorMsg?.buyerName) {
                      setErrorMsg((prev) => ({
                        ...prev,
                        buyerName: '',
                      }));
                    }
                  }}
                />
              );
            }
            if (field.key === 'addressType') {
              return (
                <Select
                  value={order.addressType}
                  onValueChange={(val) => {
                    const updatedOrder = {
                      ...order,
                      addressType: val,
                    };

                    setOrder(updatedOrder);
                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: updatedOrder,
                    });

                    if (errorMsg?.addressType) {
                      setErrorMsg((prev) => ({
                        ...prev,
                        addressType: '',
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="h-10 rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/20">
                    <SelectValue
                      placeholder={translations(
                        'form.input.address_type.placeholder',
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border border-neutral-100 bg-white shadow-md">
                    {addressTypesOptions?.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }
            if (field.key === 'buyerAddress') {
              return (
                <Input
                  type="text"
                  placeholder={translations(
                    'form.input.customer_address.placeholder',
                  )}
                  className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                  value={order.buyerAddress || ''}
                  onChange={(e) => {
                    const updatedOrder = {
                      ...order,
                      buyerAddress: e.target.value,
                    };
                    setOrder(updatedOrder);
                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: updatedOrder,
                    });

                    if (errorMsg?.buyerAddress) {
                      setErrorMsg((prev) => ({
                        ...prev,
                        buyerAddress: '',
                      }));
                    }
                  }}
                />
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
                      key: 'b2CInvoiceDraft',
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
            return null;
          }}
        />
      </section>
    </div>
  );
}
