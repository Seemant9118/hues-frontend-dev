'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { getStylesForSelectComponent } from '@/appUtils/helperFunctions';
import AddModal from '@/components/Modals/AddModal';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LocalStorageService } from '@/lib/utils';
import {
  createClient,
  getClients,
} from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  createVendor,
  getVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import Select from 'react-select';

export default function BuyerContext({
  formData = {},
  setFormData,
  errors = {},
}) {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOffer = formData.cta === 'offer';

  /* ---------------- FETCH ENTITIES ---------------- */

  const { data: entities = [] } = useQuery({
    queryKey: isOffer
      ? [clientEnterprise.getClients.endpointKey]
      : [vendorEnterprise.getVendors.endpointKey],
    queryFn: () =>
      isOffer
        ? getClients({ id: enterpriseId, context: 'ORDER' })
        : getVendors({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res.data.data.users,
  });

  /* ---------------- OPTIONS ---------------- */

  const selectionOptions = [
    ...entities.map((entity) => {
      const data = isOffer
        ? entity.client || entity.invitation?.userDetails
        : entity.vendor || entity.invitation?.userDetails;

      return {
        value: (isOffer ? entity.client?.id : entity.vendor?.id) || entity.id,
        id: entity.id, // Relation ID
        label: data?.name,
        data,
        isAccepted: entity.invitation?.status ?? 'ACCEPTED',
        isEnterpriseActive: !!(isOffer ? entity.client?.id : entity.vendor?.id),
      };
    }),
    {
      value: isOffer ? 'add-new-client' : 'add-new-vendor',
      id: isOffer ? 'add-new-client' : 'add-new-vendor',
      label: (
        <span className="flex items-center gap-2 text-xs font-semibold">
          <Plus size={14} /> {isOffer ? 'Add New Client' : 'Add New Vendor'}
        </span>
      ),
    },
  ];

  /* ---------------- HELPERS ---------------- */

  const updateFormData = (updates) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleSelect = (selected) => {
    if (!selected) return;

    if (
      selected.value === 'add-new-client' ||
      selected.value === 'add-new-vendor'
    ) {
      setIsModalOpen(true);
      return;
    }

    const data = selected.data || {};

    if (isOffer) {
      updateFormData({
        clientId: selected.id,
        buyerId: selected.value,
        contactPerson: data.contactPerson || '',
        email: data.email || '',
        mobile: data.mobileNumber || '',
        billingAddressText: data.address || '',
        serviceLocation: data.serviceLocation || '',
        orderItems: [], // Reset items when client changes
        amount: 0,
        gstAmount: 0,
      });
    } else {
      updateFormData({
        vendorId: selected.id,
        sellerEnterpriseId: selected.value,
        contactPerson: data.contactPerson || '',
        email: data.email || '',
        mobile: data.mobileNumber || '',
        billingAddressText: data.address || '',
        serviceLocation: data.serviceLocation || '',
        orderItems: [], // Reset items when vendor changes
        amount: 0,
        gstAmount: 0,
      });
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <section className="space-y-6">
      {/* Client Selector */}
      <div className="space-y-2 text-sm">
        <Label className="flex gap-1">
          {isOffer ? 'Client' : 'Vendor'}{' '}
          <span className="text-red-600">*</span>
        </Label>

        <Select
          options={selectionOptions}
          styles={getStylesForSelectComponent()}
          placeholder={isOffer ? 'Select Client' : 'Select Vendor'}
          getOptionValue={(option) => option.id}
          getOptionLabel={(option) => option.label}
          isDisabled={formData.isEditing}
          value={
            selectionOptions.find(
              (opt) =>
                (isOffer &&
                  (opt.id === formData.clientId ||
                    opt.value === formData.buyerId)) ||
                (!isOffer &&
                  (opt.id === formData.vendorId ||
                    opt.value === formData.sellerEnterpriseId)),
            ) || null
          }
          onChange={handleSelect}
        />

        {isOffer
          ? errors.buyerId && <ErrorBox msg={errors.buyerId} />
          : errors.sellerEnterpriseId && (
              <ErrorBox msg={errors.sellerEnterpriseId} />
            )}
      </div>

      {/* Add Client Modal */}
      {isModalOpen && (
        <AddModal
          type="Add"
          cta={isOffer ? 'client' : 'vendor'}
          btnName={isOffer ? 'Add a new Client' : 'Add a new Vendor'}
          mutationFunc={isOffer ? createClient : createVendor}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
        />
      )}

      {/* Contact Info */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label>
            Contact Person <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Enter Contact Person"
            value={formData.contactPerson || ''}
            onChange={(e) => updateFormData({ contactPerson: e.target.value })}
          />
          {errors.contactPerson && <ErrorBox msg={errors.contactPerson} />}
        </div>

        <div>
          <Label>
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            placeholder="Enter Email"
            value={formData.email || ''}
            onChange={(e) => updateFormData({ email: e.target.value })}
          />
          {errors.email && <ErrorBox msg={errors.email} />}
        </div>

        <div>
          <Label>
            Mobile <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Enter Mobile"
            value={formData.mobile || ''}
            onChange={(e) => updateFormData({ mobile: e.target.value })}
          />
          {errors.mobile && <ErrorBox msg={errors.mobile} />}
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label>
            Billing Address <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder="Enter Billing Address"
            rows={3}
            value={formData.billingAddressText || ''}
            onChange={(e) =>
              updateFormData({
                billingAddressText: e.target.value,
              })
            }
          />
          {errors.billingAddress && <ErrorBox msg={errors.billingAddress} />}
        </div>

        <div>
          <Label>
            Service Location <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder="Enter Service Location"
            rows={3}
            value={formData.serviceLocation || ''}
            onChange={(e) =>
              updateFormData({
                serviceLocation: e.target.value,
              })
            }
          />
          {errors.serviceLocation && <ErrorBox msg={errors.serviceLocation} />}
        </div>
      </div>
    </section>
  );
}
