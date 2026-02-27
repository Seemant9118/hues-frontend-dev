'use client';

import DynamicForm from '@/components/DynamicForm/DynamicForm';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

/*  SCHEMA  */
const GST_FILING_SCHEMA = [
  {
    name: 'serviceCode',
    label: 'Service Code',
    type: 'input',
    disabled: true,
    required: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    disabled: true,
    helperText: 'Auto-populated from Service Master (read-only)',
  },
  {
    name: 'quantity',
    label: 'Quantity',
    type: 'number',
    required: true,
  },
  {
    name: 'unit',
    label: 'Unit',
    type: 'select',
    options: [
      { label: 'Nos', value: 'nos' },
      { label: 'Month', value: 'month' },
    ],
  },
  {
    name: 'rate',
    label: 'Rate (₹)',
    type: 'number',
  },
  {
    name: 'discount',
    label: 'Discount (%)',
    type: 'number',
  },
  {
    name: 'gst',
    label: 'GST (%)',
    type: 'number',
    disabled: true,
  },
  {
    name: 'lineTotal',
    label: 'Line Total',
    type: 'input',
    disabled: true,
  },
];

export default function ServicesLineItems({
  formData = {},
  setFormData,
  errors = {},
}) {
  const items = formData.services || [];

  /*  helpers */
  const updateServices = (updater) => {
    setFormData((prev) => ({
      ...prev,
      services: updater(prev.services || []),
    }));
  };

  const addItem = () => {
    updateServices((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        serviceType: '',
        schema: [],
        formData: {},
      },
    ]);
  };

  const removeItem = (id) => {
    updateServices((prev) => prev.filter((item) => item.id !== id));
  };

  const handleServiceSelect = (id, serviceType) => {
    updateServices((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              serviceType,
              schema: GST_FILING_SCHEMA,
              formData: {
                serviceCode: 'SV-COMP-GST',
                description: 'Professional GST return filing services',
                longDescription: '',
                gst: 18,
                quantity: 1,
                unit: 'nos',
                rate: 0,
                discount: 0,
                lineTotal: '₹0.00',
              },
            }
          : item,
      ),
    );
  };

  const updateItemFormData = (id, updater) => {
    updateServices((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              formData: updater(item.formData),
            }
          : item,
      ),
    );
  };

  return (
    <section className="space-y-6">
      <Accordion type="multiple" className="space-y-4">
        {items.map((item, index) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="rounded-lg border"
          >
            <div className="flex items-center justify-between px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="text-left">
                  <p className="font-medium">
                    {item.serviceType || 'New Service'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.formData?.serviceCode || 'Service Code'}
                  </p>
                </div>
              </AccordionTrigger>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            <AccordionContent className="space-y-6 px-4 pb-6">
              {/* Service Selector */}
              <div className="space-y-2">
                <Label>
                  Service <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={item.serviceType}
                  onValueChange={(val) => handleServiceSelect(item.id, val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GST_FILING">
                      SV-COMP-GST — GST Filing (Compliance)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Fields */}
              {GST_FILING_SCHEMA.length > 0 && (
                <DynamicForm
                  schema={GST_FILING_SCHEMA}
                  formData={item.formData}
                  setFormData={(fn) => updateItemFormData(item.id, fn)}
                  errors={errors?.[index] || {}}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button variant="outline" className="w-full" onClick={addItem}>
        <Plus className="mr-2 h-4 w-4" />
        Add Service Line Item
      </Button>
    </section>
  );
}
