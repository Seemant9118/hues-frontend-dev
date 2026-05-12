'use client';

import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { getStylesForSelectComponent } from '@/appUtils/helperFunctions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Label } from '@/components/ui/label';
import { LocalStorageService } from '@/lib/utils';
import {
  getServiceCatalogue,
  getVendorServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import Select from 'react-select';
import ServiceItemDynamicStep from './ServiceItemDynamicStep';

export default function ServicesLineItems({
  formData = {},
  setFormData,
  errors = {},
}) {
  const items = formData.orderItems || [];
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  /*  helpers */
  const updateOrderItems = (updater) => {
    setFormData((prev) => {
      const newItems = updater(prev.orderItems || []);

      // Recalculate root totals
      const totalExclGst = newItems.reduce(
        (acc, item) => acc + (Number(item.totalAmount) || 0),
        0,
      );
      const totalGst = newItems.reduce(
        (acc, item) => acc + (Number(item.totalGstAmount) || 0),
        0,
      );

      return {
        ...prev,
        orderItems: newItems,
        amount: totalExclGst,
        gstAmount: totalGst,
      };
    });
  };

  const addItem = () => {
    updateOrderItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(), // Internal handle
        productType: 'SERVICE',
        productId: '',
        serviceName: '',
        quantity: 1,
        unitPrice: 0,
        discountPercentage: 0,
        discountAmount: 0,
        gstPercentage: 0,
        gstPerUnit: 0,
        totalAmount: 0,
        totalGstAmount: 0,
        finalAmount: 0,
        serviceConfig: {}, // Flattened config values here
      },
    ]);
  };

  const removeItem = (id) => {
    updateOrderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateTotals = (item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const discPct = Number(item.discountPercentage) || 0;
    const gstPct = Number(item.gstPercentage) || 0;

    // 1. Discount
    const discountAmount = price * (discPct / 100);
    const discountedPrice = price - discountAmount;

    // 2. Base Total (Excl GST)
    const totalAmount = qty * discountedPrice;

    // 3. GST Calculations
    const gstPerUnit = gstPct;
    const totalGstAmount = totalAmount * (gstPct / 100);

    // 4. Final Total
    const finalAmount = totalAmount + totalGstAmount;

    return {
      ...item,
      discountAmount,
      totalAmount,
      gstPerUnit,
      totalGstAmount,
      finalAmount,
    };
  };

  const handleServiceSelect = (id, selectedOption) => {
    const service = selectedOption?.value;
    if (!service) return;

    // Deep copy the service config to store as serviceConfig
    const initialServiceConfig = service.config
      ? JSON.parse(JSON.stringify(service.config))
      : {};

    const basePrice = Number(service.cataloguePrice) || 0;
    const gstPct = Number(service.gstPercentage) || 0;

    updateOrderItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updatedItem = {
          ...item,
          productId: service.id,
          serviceName: service.serviceName || service.name,
          serviceCode: service.serviceCode || service.code || 'N/A',
          unitPrice: basePrice,
          gstPercentage: gstPct,
          unit: service.unitOfMeasure || null,
          // Store absolute copy of config as schema + values (via defaultValue)
          serviceConfig: initialServiceConfig,
        };

        return calculateTotals(updatedItem);
      }),
    );
  };

  // const updateItemField = (id, fieldUpdates) => {
  //   updateOrderItems((prev) =>
  //     prev.map((item) => {
  //       if (item.id !== id) return item;
  //       const updated = { ...item, ...fieldUpdates };
  //       return calculateTotals(updated);
  //     }),
  //   );
  // };

  const updateServiceConfig = (id, configUpdates) => {
    updateOrderItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        // Resolve updater:
        // - New path (ServiceItemDynamicStep): updater = (prevServiceConfig) => newServiceConfig
        //   where newServiceConfig is the full field-object map.
        // - Legacy path: plain { fieldName: value } object with flat defaultValues.
        let newServiceConfig;

        if (typeof configUpdates === 'function') {
          // Updater receives and returns the FULL serviceConfig object
          newServiceConfig = configUpdates(item.serviceConfig || {});
        } else {
          // Legacy: merge flat { name: value } into field objects
          newServiceConfig = { ...(item.serviceConfig || {}) };
          Object.keys(configUpdates).forEach((key) => {
            if (newServiceConfig[key]) {
              newServiceConfig[key] = {
                ...newServiceConfig[key],
                defaultValue: configUpdates[key],
              };
            }
          });
        }

        // Sync well-known fields up to root-level order item props
        const syncUpdates = {};
        const qtyDV = newServiceConfig?.quantity?.defaultValue;
        const priceDV = newServiceConfig?.base_price?.defaultValue;
        const discDV = newServiceConfig?.discount?.defaultValue;
        const gstDV = newServiceConfig?.gst_percentage?.defaultValue;

        if (qtyDV !== undefined) syncUpdates.quantity = Number(qtyDV);
        if (priceDV !== undefined) syncUpdates.unitPrice = Number(priceDV);
        if (discDV !== undefined)
          syncUpdates.discountPercentage = Number(discDV);
        if (gstDV !== undefined) syncUpdates.gstPercentage = Number(gstDV);

        const updated = {
          ...item,
          ...syncUpdates,
          serviceConfig: newServiceConfig,
        };

        return calculateTotals(updated);
      }),
    );
  };

  // Fetch catalogue services
  const catalogueTargetId =
    formData.cta === 'offer' ? enterpriseId : formData.sellerEnterpriseId;

  const { data: servicesData } = useQuery({
    queryKey: [
      formData.cta === 'offer'
        ? catalogueApis.getServiceCatalogue.endpointKey
        : catalogueApis.getVendorServiceCatalogue.endpointKey,
      catalogueTargetId,
    ],
    queryFn: () =>
      formData.cta === 'offer'
        ? getServiceCatalogue(catalogueTargetId)
        : getVendorServiceCatalogue(catalogueTargetId),
    select: (res) => res.data.data,
    enabled: !!catalogueTargetId,
  });

  const serviceOptions = useMemo(() => {
    return (
      servicesData?.map((service) => ({
        value: service,
        label: service?.name,
      })) || []
    );
  }, [servicesData]);

  return (
    <section className="space-y-6">
      <Accordion
        type="multiple"
        className="space-y-4"
        defaultValue={items.map((item) => item.id)}
      >
        {items.map((item, index) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="rounded-lg border"
          >
            <div className="flex items-center justify-between gap-2 px-4">
              <AccordionTrigger className="justify-start gap-2 hover:no-underline [&>svg]:order-first">
                <div className="text-left font-medium">
                  {item.serviceName || 'New Service'}
                </div>
              </AccordionTrigger>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <AccordionContent className="space-y-6 px-4 pb-6">
              {/* Service Selector */}
              <div className="space-y-2">
                <Label className="flex gap-1">
                  Service <span className="text-red-600">*</span>
                </Label>
                <Select
                  placeholder="Select Service"
                  options={serviceOptions}
                  styles={getStylesForSelectComponent()}
                  value={
                    serviceOptions.find(
                      (opt) => opt.value.id === item.productId,
                    ) || null
                  }
                  onChange={(opt) => handleServiceSelect(item.id, opt)}
                  menuPortalTarget={
                    typeof window !== 'undefined' ? document.body : null
                  }
                  menuPosition="fixed"
                />
                {errors[index]?.productId && (
                  <ErrorBox msg={errors[index].productId} />
                )}
              </div>

              {/* Dynamic Content */}
              {item.productId && (
                <div className="">
                  {/* Master Controls */}
                  {/* <div className="mb-4 grid grid-cols-2 gap-4 border-b pb-4 md:grid-cols-4">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        size="sm"
                        value={item.quantity}
                        onChange={(e) => updateItemField(item.id, { quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Unit Price (₹)</Label>
                      <Input
                        type="number"
                        size="sm"
                        value={item.unitPrice}
                        onChange={(e) => updateItemField(item.id, { unitPrice: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Disc (%)</Label>
                      <Input
                        type="number"
                        size="sm"
                        value={item.discountPercentage}
                        onChange={(e) => updateItemField(item.id, { discountPercentage: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">GST (%)</Label>
                      <Input
                        type="number"
                        size="sm"
                        disabled
                        value={item.gstPercentage}
                      />
                    </div>
                  </div> */}

                  {/* Config Fields – section-grouped layout */}
                  {item.serviceConfig &&
                    Object.keys(item.serviceConfig).length > 0 && (
                      <div className="py-2">
                        <Label className="mb-2 block text-[10px] uppercase text-muted-foreground">
                          Configuration Fields
                        </Label>
                        <ServiceItemDynamicStep
                          item={item}
                          onConfigChange={(updater) =>
                            updateServiceConfig(item.id, updater)
                          }
                          errors={errors[index]?.serviceConfig || {}}
                        />
                      </div>
                    )}

                  {/* Item Summary */}
                  <div className="mt-4 flex flex-col gap-1 border-t pt-4 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal (Excl Tax)</span>
                      <span>₹{item.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total Tax</span>
                      <span>₹{item.totalGstAmount?.toLocaleString()}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-sm font-bold text-primary">
                      <span>Final Amount</span>
                      <span>₹{item.finalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={addItem}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Service Line Item
      </Button>

      {/* Aggregate Balance */}
      <div className="mt-6 space-y-2 rounded-lg border border-primary/10 bg-primary/5 p-4">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal (All Items)</span>
          <span>₹{formData.amount?.toLocaleString() || 0}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Total GST (All Items)</span>
          <span>₹{formData.gstAmount?.toLocaleString() || 0}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-xl font-bold text-primary">
          <span>Grand Total</span>
          <span>
            ₹
            {(
              (formData.amount || 0) + (formData.gstAmount || 0)
            ).toLocaleString()}
          </span>
        </div>
      </div>

      {errors._error && <ErrorBox msg={errors._error} />}
    </section>
  );
}
