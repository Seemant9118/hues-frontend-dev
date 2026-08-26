import React from 'react';
import Select from 'react-select';
import {
  checkVendorGSTApplicability,
  getStylesForSelectComponent,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';
import { createClient } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { createVendor } from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import AddModal from '../../../../Modals/AddModal';

export const ClientVendorSection = ({
  isOffer,
  isOfferType,
  order,
  setOrder,
  fields,
  handleSetFields,
  baseVersion,
  etag,
  originalCustomFields,
  originalSystemFields,
  revision,
  handleSaveSuccess,
  clientOptions,
  vendorOptions,
  setSelectedItem,
  initialItemState,
  isModalOpen,
  setIsModalOpen,
  setIsGstApplicableForPurchaseOrders,
  errorMsg,
  translations,
  cta,
}) => {
  if (isOfferType !== 'GOODS') return null;

  return (
    <div className="flex-shrink-0">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary">
        {isOffer ? 'Client Details' : 'Vendor Details'}
      </span>
      <section className="border-b bg-white p-2 shadow-none">
        <DynamicFormRenderer
          module={isOffer ? 'SALES_ORDER' : 'PURCHASE_ORDER'}
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
            if (f.kind === 'CUSTOM') return false;
            return isOffer
              ? f.key === 'buyerId'
              : f.key === 'sellerEnterpriseId';
          }}
          onChange={(key, value) => {
            const updatedOrder = { ...order, [key]: value };
            setOrder(updatedOrder);
            saveDraftToSession({ cta, data: updatedOrder });
          }}
          errors={errorMsg}
          renderCustomField={(field) => {
            if (field.key === 'buyerId') {
              if (!isOffer) return null;
              return (
                <Select
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

                    setSelectedItem(initialItemState);
                    const { value: id, isEnterpriseActive } = selectedOption;

                    if (id === 'add-new-client') {
                      setIsModalOpen(true);
                    } else {
                      const updatedOrder = {
                        ...order,
                        buyerId: id,
                        orderItems: [],
                      };
                      setOrder({
                        ...updatedOrder,
                        selectedValue: selectedOption,
                        buyerType: isEnterpriseActive
                          ? 'ENTERPRISE'
                          : 'UNCONFIRMED_ENTERPRISE',
                      });
                      saveDraftToSession({
                        cta,
                        data: {
                          ...updatedOrder,
                          selectedValue: selectedOption,
                        },
                      });
                    }
                  }}
                />
              );
            }
            if (field.key === 'sellerEnterpriseId') {
              if (isOffer) return null;
              return (
                <Select
                  name="vendors"
                  placeholder={translations('form.input.vendor.placeholder')}
                  options={vendorOptions}
                  styles={getStylesForSelectComponent()}
                  className="text-sm font-medium"
                  classNamePrefix="select"
                  value={
                    vendorOptions?.find(
                      (option) => option.value === order?.selectedValue?.value,
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    if (!selectedOption) return;

                    setSelectedItem(initialItemState);
                    const { value: id, originalVendor } = selectedOption;

                    if (selectedOption.value === 'add-new-vendor') {
                      setIsModalOpen(true);
                    } else {
                      setIsGstApplicableForPurchaseOrders(
                        checkVendorGSTApplicability(originalVendor),
                      );

                      const updatedOrder = {
                        ...order,
                        sellerEnterpriseId: id,
                        orderItems: [],
                      };
                      setOrder({
                        ...updatedOrder,
                        selectedValue: selectedOption,
                      });
                      saveDraftToSession({
                        cta,
                        data: {
                          ...updatedOrder,
                          selectedValue: selectedOption,
                        },
                      });
                    }
                  }}
                />
              );
            }
            return null;
          }}
        />
        {isModalOpen && isOffer && (
          <AddModal
            type="Add"
            cta="client"
            btnName="Add a new Client"
            mutationFunc={createClient}
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
          />
        )}
        {isModalOpen && !isOffer && (
          <AddModal
            type="Add"
            cta="vendor"
            btnName="Add a new Vendor"
            mutationFunc={createVendor}
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
          />
        )}
      </section>
    </div>
  );
};
