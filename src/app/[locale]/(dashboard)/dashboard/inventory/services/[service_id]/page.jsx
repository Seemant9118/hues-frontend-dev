'use client';

import { servicesApi } from '@/api/inventories/services/services';
import {
  capitalize,
  convertSnakeToTitleCase,
  formattedAmount,
} from '@/appUtils/helperFunctions';

import ConfirmAction from '@/components/Modals/ConfirmAction';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  DeleteProductServices,
  GetProductServices,
} from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';

const EditService = dynamic(() => import('@/components/inventory/AddService'), {
  loading: () => <Loading />,
});

const ViewService = () => {
  const translations = useTranslations('services.serviceDetails');
  const router = useRouter();
  const params = useParams();
  const [tab, setTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [servicesToEdit, setServicesToEdit] = useState(null);

  const itemsBreadCrumbs = [
    {
      id: 1,
      name: translations('title.items'),
      path: '/dashboard/inventory/services',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title.item_details'),
      path: `/dashboard/inventory/services/${params.service_id}`,
      show: true, // Always show
    },
  ];

  const onTabChange = (tab) => {
    setTab(tab);
  };

  // item details fetching
  const { data: itemDetails } = useQuery({
    queryKey: [servicesApi.getProductServices.endpointKey, params.service_id],
    queryFn: () => GetProductServices(params.service_id),
    select: (res) => res.data.data,
    enabled: true,
  });

  const overviewData = {
    serviceName: itemDetails?.serviceName,
    serviceCategory: capitalize(itemDetails?.serviceCategory),
    serviceSubType: capitalize(itemDetails?.serviceSubType),
    deliveryMode: convertSnakeToTitleCase(itemDetails?.deliveryMode),
    unitOfMeasure: convertSnakeToTitleCase(itemDetails?.unitOfMeasure),
    defaultDuration: itemDetails?.defaultDuration,
    basePrice: formattedAmount(itemDetails?.basePrice),
    pricingModel: capitalize(itemDetails?.pricingModel),
    gstPercentage: itemDetails?.gstPercentage ?? '-', // null → show "-"
    sacCode: itemDetails?.sacCode,
    locationRequirements: itemDetails?.locationRequirements || '--',
    shortDescription: capitalize(itemDetails?.shortDescription) || '--',
    longDescription: capitalize(itemDetails?.longDescription) || '--',
    createdAt: moment(itemDetails?.createdAt).format('DD-MM-YYYY'),
  };

  const overviewLabels = {
    serviceName: 'Service Name',
    serviceCategory: 'Service Category',
    serviceSubType: 'Service Sub-Type',
    deliveryMode: 'Delivery Mode',
    unitOfMeasure: 'Unit of Measure',
    defaultDuration: 'Default Duration',
    basePrice: 'Base Price',
    pricingModel: 'Pricing Model',
    gstPercentage: 'GST Percentage',
    sacCode: 'SAC Code',
    locationRequirements: 'Location Requirements',
    shortDescription: 'Short Description',
    longDescription: 'Long Description',
    createdAt: 'Created On',
  };

  return (
    <ProtectedWrapper permissionCode={'permission:item-masters-view'}>
      {!isEditing && (
        <Wrapper className="h-full py-2">
          {/* Headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => router.back()}
                className="rounded-sm p-2 hover:bg-gray-100"
              >
                <ArrowLeft size={16} />
              </button>
              {/* breadcrumbs */}
              <OrderBreadCrumbs possiblePagesBreadcrumbs={itemsBreadCrumbs} />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  setIsEditing((prev) => !prev);
                  e.stopPropagation();
                  setServicesToEdit(itemDetails);
                }}
              >
                <Pencil size={12} />
                {translations('ctas.edit')}
              </Button>

              <ConfirmAction
                deleteCta={translations('ctas.delete')}
                infoText={translations('ctas.infoText', {
                  name: itemDetails?.serviceName,
                })}
                cancelCta={translations('ctas.cancel')}
                id={itemDetails?.id}
                mutationFunc={DeleteProductServices}
                successMsg={translations('ctas.successMsg')}
                invalidateKey={servicesApi.getAllProductServices.endpointKey}
                redirectedTo={() =>
                  router.push('/dashboard/inventory/services')
                }
              />
            </div>
          </section>

          {/* Content */}
          <Tabs
            value={tab}
            onValueChange={onTabChange}
            defaultValue={'overview'}
          >
            <TabsList className="border">
              <TabsTrigger value="overview">
                {translations('tabs.tab1.title')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Overview data={overviewData} labelMap={overviewLabels} />
            </TabsContent>
          </Tabs>
        </Wrapper>
      )}
      {isEditing && (
        <EditService
          setIsCreatingService={setIsEditing}
          servicesToEdit={servicesToEdit}
        />
      )}
    </ProtectedWrapper>
  );
};

export default ViewService;
