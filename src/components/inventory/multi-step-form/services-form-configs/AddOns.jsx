import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import React, { useState } from 'react';
import AddOnsModal from '../components/AddOnsModal';

const AddOns = ({ formData, setFormData, translation }) => {
  const [open, setOpen] = useState(false);

  const addOns = formData?.addOnServices || [];

  // ---- REMOVE SPECIFIC ADD-ON ----
  const removeAddOn = (index) => {
    setFormData((prev) => ({
      ...prev,
      addOnServices: prev.addOnServices.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="mt-4 flex flex-col gap-6">
      {/* ------------- BASE PRICING ------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.addOns.section1.title') ||
          'Add-on Services'}
      </h2>

      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus size={16} /> Add Add-On Service
      </Button>

      {/* ---------------- ADD-ON LIST (ARRAY) ---------------- */}
      <div className="flex flex-col gap-4">
        {addOns.length > 0 &&
          addOns.map((item, index) => (
            <div
              key={item}
              className="rounded-lg border bg-muted/30 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  {item?.serviceName || 'Add-on Service'}
                </h3>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => removeAddOn(index)}
                >
                  <Trash size={16} />
                </Button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <p>
                  <span className="font-medium">Pricing Model:</span>{' '}
                  {item?.pricingModel}
                </p>

                <p>
                  <span className="font-medium">Base Price:</span>{' '}
                  {item?.currency} {item?.basePrice}
                </p>

                <p>
                  <span className="font-medium">GST Rate:</span> {item?.gstRate}
                  %
                </p>

                <p className="col-span-2">
                  <span className="font-medium">Description:</span>{' '}
                  {item?.shortDescription}
                </p>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      <AddOnsModal
        open={open}
        onClose={() => setOpen(false)}
        setFormData={setFormData}
      />
    </div>
  );
};

export default AddOns;
