import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { SelectValue } from '@radix-ui/react-select';
import React, { useState } from 'react';
import { toast } from 'sonner';

const currencyOptions = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
];

const pricingModels = [
  { value: 'FIXED', label: 'Fixed' },
  { value: 'HOURLY', label: 'Hourly' },
  { value: 'TIERED', label: 'Tiered' },
  { value: 'UNIT', label: 'Per Unit' },
  { value: 'SUBSCRIPTION', label: 'Subscription' },
];

// GST list
const gstRates = [
  {
    taxClass: 'GST_18',
    gstPercentage: 18,
    label: '18% - Professional Services',
  },
  { taxClass: 'GST_12', gstPercentage: 12, label: '12% - Maintenance' },
  { taxClass: 'GST_5', gstPercentage: 5, label: '5% - Transport' },
  { taxClass: 'GST_0', gstPercentage: 0, label: '0% - Exempt' },
];

const initialState = {
  serviceName: '',
  currency: 'INR',
  basePrice: '',
  pricingModel: '',
  taxClass: '',
  gstPercentage: '',
  shortDescription: '',
};

const AddOnsModal = ({ open, onClose, setFormData }) => {
  const [addOnsServices, setAddOnServices] = useState(initialState);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};

    if (!addOnsServices.serviceName?.trim())
      e.serviceName = 'Service Name is required';

    if (!addOnsServices.currency) e.currency = 'Currency is required';

    if (!addOnsServices.basePrice || Number(addOnsServices.basePrice) <= 0)
      e.basePrice = 'Base price must be greater than 0';

    if (!addOnsServices.pricingModel)
      e.pricingModel = 'Pricing model is required';

    if (!addOnsServices.taxClass) e.taxClass = 'GST rate is required';

    if (!addOnsServices.shortDescription?.trim())
      e.shortDescription = 'Short description is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key) => (valueOrEvent) => {
    const value = valueOrEvent?.target
      ? valueOrEvent.target.value
      : valueOrEvent;

    setAddOnServices((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleGstChange = (selectedTaxClass) => {
    const selected = gstRates.find((o) => o.taxClass === selectedTaxClass);

    if (selected) {
      setAddOnServices((prev) => ({
        ...prev,
        taxClass: selected.taxClass,
        gstPercentage: selected.gstPercentage,
      }));

      setErrors((prev) => ({ ...prev, taxClass: null }));
    }
  };

  const handleClose = () => {
    setAddOnServices(initialState);
    setErrors({});
    onClose();
  };

  const handleSubmit = () => {
    if (!validate()) return;

    setFormData((prev) => ({
      ...prev,
      addOnServices: [
        ...(prev.addOnServices || []),
        {
          ...addOnsServices,
          basePrice: Number(addOnsServices.basePrice),
        },
      ],
    }));

    toast.success('Add-On service added successfully');
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-w-2xl flex-col gap-8">
        <DialogHeader>
          <DialogTitle>Add-on Services</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Service Name */}
          <div>
            <Label>
              Service Name <span className="text-red-600">*</span>
            </Label>
            <Input
              placeholder="Service name"
              value={addOnsServices.serviceName}
              onChange={handleChange('serviceName')}
            />
            {errors.serviceName && <ErrorBox msg={errors.serviceName} />}
          </div>

          {/* Currency + Base Price */}
          <div className="flex gap-2">
            <div className="w-24">
              <Label>
                Currency <span className="text-red-600">*</span>
              </Label>
              <Select
                value={addOnsServices.currency}
                onValueChange={handleChange('currency')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="INR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {currencyOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.currency && <ErrorBox msg={errors.currency} />}
            </div>

            <div className="flex-1">
              <Label>
                Base Price <span className="text-red-600">*</span>
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={addOnsServices.basePrice}
                onChange={handleChange('basePrice')}
              />
              {errors.basePrice && <ErrorBox msg={errors.basePrice} />}
            </div>
          </div>

          {/* Pricing Model */}
          <div>
            <Label>
              Pricing Model <span className="text-red-600">*</span>
            </Label>
            <Select
              value={addOnsServices.pricingModel}
              onValueChange={handleChange('pricingModel')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pricingModels.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.pricingModel && <ErrorBox msg={errors.pricingModel} />}
          </div>

          {/* GST Rate */}
          <div>
            <Label>
              Tax Class / GST Rate <span className="text-red-600">*</span>
            </Label>
            <Select
              value={addOnsServices.taxClass}
              onValueChange={handleGstChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tax rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {gstRates.map((o) => (
                    <SelectItem key={o.taxClass} value={o.taxClass}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {errors.taxClass && <ErrorBox msg={errors.taxClass} />}
          </div>

          {/* Short Description */}
          <div className="col-span-2">
            <Label>
              Short Description <span className="text-red-600">*</span>
            </Label>
            <Input
              placeholder="Brief description for listings and invoices"
              value={addOnsServices.shortDescription}
              onChange={handleChange('shortDescription')}
            />
            {errors.shortDescription && (
              <ErrorBox msg={errors.shortDescription} />
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddOnsModal;
