'use client';

import React from 'react';
import Select from 'react-select';
import { Plus } from 'lucide-react';
import { getStylesForSelectComponent } from '@/appUtils/helperFunctions';
import AddModal from '@/components/Modals/AddModal';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBuyerContextEntities } from '../hooks/useBuyerContextEntities';

export default function BuyerContext({
  formData = {},
  setFormData,
  errors = {},
}) {
  const {
    isOffer,
    isModalOpen,
    setIsModalOpen,
    entityOptions,
    selectedEntityValue,
    handleEntitySelect,
    createClient,
    createVendor,
  } = useBuyerContextEntities({ formData, setFormData });

  return (
    <div className="flex h-full flex-col space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">
          {isOffer ? 'Client Context' : 'Vendor Context'}
        </h3>
        <p className="text-xs text-neutral-500">
          Provide basic details regarding the {isOffer ? 'client' : 'vendor'}{' '}
          for this service order.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Client / Vendor Selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">
              {isOffer ? 'Client / Customer' : 'Vendor / Supplier'}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Plus size={14} /> Add New {isOffer ? 'Client' : 'Vendor'}
            </button>
          </div>

          <Select
            options={entityOptions}
            value={selectedEntityValue}
            onChange={handleEntitySelect}
            placeholder={`Select ${isOffer ? 'Client' : 'Vendor'}...`}
            styles={getStylesForSelectComponent()}
            isClearable
          />

          <ErrorBox
            msg={isOffer ? errors.buyerId : errors.sellerEnterpriseId}
          />
        </div>

        {/* Contact Person */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold">Contact Person</Label>
          <Input
            value={formData.contactPerson || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                contactPerson: e.target.value,
              }))
            }
            placeholder="e.g. John Doe"
          />
        </div>

        {/* Contact Email */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold">Email Address</Label>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            placeholder="e.g. john@example.com"
          />
        </div>

        {/* Mobile Number */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold">Mobile Number</Label>
          <Input
            value={formData.mobile || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                mobile: e.target.value,
              }))
            }
            placeholder="e.g. +91 9876543210"
          />
        </div>

        {/* Billing Address Text */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label className="text-xs font-semibold">Billing Address</Label>
          <Textarea
            value={formData.billingAddressText || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                billingAddressText: e.target.value,
              }))
            }
            placeholder="Enter complete billing address..."
            rows={2}
          />
        </div>

        {/* Service Location */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label className="text-xs font-semibold">Service Location</Label>
          <Textarea
            value={formData.serviceLocation || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                serviceLocation: e.target.value,
              }))
            }
            placeholder="Enter service execution location / site address..."
            rows={2}
          />
        </div>
      </div>

      {/* Add Client / Vendor Modal */}
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
    </div>
  );
}
