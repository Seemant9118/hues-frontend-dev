'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
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
  const buyerContext = formData.buyerContext || {};
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ---------------- FETCH CLIENTS ---------------- */

  const { data: clients = [] } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res.data.data.users,
  });

  /* ---------------- OPTIONS ---------------- */

  const clientOptions = [
    ...clients.map((client) => {
      const data = client.client || client.invitation?.userDetails;

      return {
        value: client.client?.id || client.id, // ✅ buyerId (enterprise id)
        clientId: client.id, // ✅ clientId (relation id)
        label: data?.name,
        data,
        isAccepted: client.invitation?.status ?? 'ACCEPTED',
        isEnterpriseActive: !!client.client?.id,
      };
    }),
    {
      value: 'add-new-client',
      clientId: 'add-new-client',
      label: (
        <span className="flex items-center gap-2 text-xs font-semibold">
          <Plus size={14} /> Add New Client
        </span>
      ),
    },
  ];

  /* ---------------- HELPERS ---------------- */

  const updateBuyerContext = (updates) => {
    setFormData((prev) => ({
      ...prev,
      buyerContext: {
        ...prev.buyerContext,
        ...updates,
      },
    }));
  };

  const handleClientSelect = (selected) => {
    if (!selected) return;

    if (selected.value === 'add-new-client') {
      setIsModalOpen(true);
      return;
    }

    const data = selected.data || {};

    updateBuyerContext({
      clientId: selected.clientId, // ✅ for UI selection
      buyerId: selected.value, // ✅ for API payload
      contactPerson: data.contactPerson || '',
      email: data.email || '',
      mobile: data.mobileNumber || '',
      billingAddress: data.address || '',
      serviceLocation: data.serviceLocation || '',
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <section className="space-y-6">
      {/* Client Selector */}
      <div className="space-y-2 text-sm">
        <Label className="flex gap-1">
          Client <span className="text-red-600">*</span>
        </Label>

        <Select
          options={clientOptions}
          styles={getStylesForSelectComponent()}
          placeholder="Select Client"
          getOptionValue={(option) => option.clientId}
          getOptionLabel={(option) => option.label}
          value={
            clientOptions.find(
              (opt) => opt.clientId === buyerContext.clientId,
            ) || null
          }
          onChange={handleClientSelect}
        />

        {errors.buyerId && <ErrorBox msg={errors.buyerId} />}
      </div>

      {/* Add Client Modal */}
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

      {/* Contact Info */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label>
            Contact Person <span className="text-red-500">*</span>
          </Label>
          <Input
            value={buyerContext.contactPerson || ''}
            onChange={(e) =>
              updateBuyerContext({ contactPerson: e.target.value })
            }
          />
          {errors.contactPerson && <ErrorBox msg={errors.contactPerson} />}
        </div>

        <div>
          <Label>
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            value={buyerContext.email || ''}
            onChange={(e) => updateBuyerContext({ email: e.target.value })}
          />
          {errors.email && <ErrorBox msg={errors.email} />}
        </div>

        <div>
          <Label>
            Mobile <span className="text-red-500">*</span>
          </Label>
          <Input
            value={buyerContext.mobile || ''}
            onChange={(e) => updateBuyerContext({ mobile: e.target.value })}
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
            rows={3}
            value={buyerContext.billingAddress || ''}
            onChange={(e) =>
              updateBuyerContext({
                billingAddress: e.target.value,
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
            rows={3}
            value={buyerContext.serviceLocation || ''}
            onChange={(e) =>
              updateBuyerContext({
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
