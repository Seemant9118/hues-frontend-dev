'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { LocalStorageService } from '@/lib/utils';
import {
  createClient,
  getClients,
} from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  createVendor,
  getVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';

export function useBuyerContextEntities({ formData = {}, setFormData }) {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOffer = formData.cta === 'offer';

  // Fetch entities (Clients if offer/sales, Vendors if purchase)
  const { data: entities = [] } = useQuery({
    queryKey: isOffer
      ? [clientEnterprise.getClients.endpointKey, enterpriseId]
      : [vendorEnterprise.getVendors.endpointKey, enterpriseId],
    queryFn: () =>
      isOffer
        ? getClients({ id: enterpriseId, context: 'ORDER' })
        : getVendors({ id: enterpriseId, context: 'ORDER' }),
    enabled: !!enterpriseId,
    select: (res) => {
      const rawData = res?.data?.data;
      if (Array.isArray(rawData)) return rawData;
      if (Array.isArray(rawData?.users)) return rawData.users;
      if (Array.isArray(rawData?.vendors)) return rawData.vendors;
      if (Array.isArray(rawData?.clients)) return rawData.clients;
      return [];
    },
  });

  const entityOptions = useMemo(() => {
    const list = Array.isArray(entities) ? entities : [];
    const mapped = list.map((ent) => {
      if (isOffer) {
        const name =
          ent.clientEnterprise?.name ||
          ent.client?.name ||
          ent.invitation?.userDetails?.name ||
          ent.name ||
          'Unnamed Client';
        const value = ent.clientEnterprise?.id || ent.client?.id || ent.id;
        return {
          label: name,
          value,
          raw: ent,
        };
      }
      const name =
        ent.vendorEnterprise?.name ||
        ent.vendor?.name ||
        ent.invitation?.userDetails?.name ||
        ent.name ||
        'Unnamed Vendor';
      const value = ent.vendorEnterprise?.id || ent.vendor?.id || ent.id;
      return {
        label: name,
        value,
        raw: ent,
      };
    });

    const addNewOption = isOffer
      ? { value: 'add-new-client', label: '+ Add New Client' }
      : { value: 'add-new-vendor', label: '+ Add New Vendor' };

    return [...mapped, addNewOption];
  }, [entities, isOffer]);

  const selectedEntityValue = useMemo(() => {
    const currentId = isOffer ? formData.buyerId : formData.sellerEnterpriseId;
    if (
      !currentId ||
      currentId === 'add-new-client' ||
      currentId === 'add-new-vendor'
    )
      return null;
    return entityOptions.find((opt) => opt.value === currentId) || null;
  }, [entityOptions, isOffer, formData.buyerId, formData.sellerEnterpriseId]);

  const handleEntitySelect = (option) => {
    if (!option) {
      if (isOffer) {
        setFormData((prev) => ({ ...prev, buyerId: null }));
      } else {
        setFormData((prev) => ({ ...prev, sellerEnterpriseId: null }));
      }
      return;
    }

    if (
      option.value === 'add-new-client' ||
      option.value === 'add-new-vendor'
    ) {
      setIsModalOpen(true);
      return;
    }

    if (isOffer) {
      setFormData((prev) => ({
        ...prev,
        buyerId: option.value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        sellerEnterpriseId: option.value,
      }));
    }
  };

  return {
    isOffer,
    enterpriseId,
    isModalOpen,
    setIsModalOpen,
    entities,
    entityOptions,
    selectedEntityValue,
    handleEntitySelect,
    createClient,
    createVendor,
  };
}
