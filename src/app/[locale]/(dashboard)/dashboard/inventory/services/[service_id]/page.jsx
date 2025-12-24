'use client';

import { servicesApi } from '@/api/inventories/services/services';
import {
  capitalize,
  convertSnakeToTitleCase,
  formattedAmount,
} from '@/appUtils/helperFunctions';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Loading from '@/components/ui/Loading';
import Overview from '@/components/ui/Overview';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import {
  DeleteProductServices,
  GetProductServices,
  UpdateProductServices,
} from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MoreVertical, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const EditService = dynamic(() => import('@/components/inventory/AddService'), {
  loading: () => <Loading />,
});

const ViewService = () => {
  useMetaData('Hues! - Services Details', 'HUES Services Details');
  const translations = useTranslations('services.serviceDetails');
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const [tab, setTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [servicesToEdit, setServicesToEdit] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    isActive: false,
  });

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
    serviceName: capitalize(itemDetails?.serviceName),
    serviceCategory: capitalize(itemDetails?.serviceCategory),
    serviceSubType: capitalize(itemDetails?.serviceSubType),
    status: itemDetails?.isActive,
    basePrice: formattedAmount(itemDetails?.basePrice),
    gstPercentage: itemDetails?.gstPercentage ?? '-', // null → show "-"
    unitOfMeasure: convertSnakeToTitleCase(itemDetails?.unitOfMeasure),
    pricingModel: capitalize(itemDetails?.pricingModel),
    sacCode: itemDetails?.sacCode,
    deliveryMode: convertSnakeToTitleCase(itemDetails?.deliveryMode),
    locationRequirements: itemDetails?.locationRequirements || '--',
    defaultDuration: itemDetails?.defaultDuration,
    shortDescription: capitalize(itemDetails?.shortDescription) || '--',
    longDescription: capitalize(itemDetails?.longDescription) || '--',
  };

  const overviewLabels = {
    serviceName: 'Service Name',
    serviceCategory: 'Service Category',
    serviceSubType: 'Service Sub-Type',
    status: 'Status',
    basePrice: 'Base Price',
    gstPercentage: 'GST Percentage',
    unitOfMeasure: 'Unit of Measure',
    pricingModel: 'Pricing Model',
    sacCode: 'SAC Code',
    deliveryMode: 'Delivery Mode',
    defaultDuration: 'Default Duration',
    locationRequirements: 'Location Requirements',
    shortDescription: 'Short Description',
    longDescription: 'Long Description',
  };

  const customRender = {
    status: () => {
      return <ConditionalRenderingStatus status={itemDetails?.isActive} />;
    },
  };
  // Set default when itemDetails change
  useEffect(() => {
    setStatusUpdate({
      isActive: itemDetails?.isActive,
    });
  }, [itemDetails]);

  const updateServiceMutation = useMutation({
    mutationFn: UpdateProductServices,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [servicesApi.getProductServices.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  return (
    <ProtectedWrapper permissionCode={'permission:item-masters-view'}>
      {!isEditing && (
        <Wrapper className="h-full py-2">
          {/* Headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex items-center gap-1">
              {/* breadcrumbs */}
              <button
                onClick={() => router.push('/dashboard/inventory/services')}
                className="rounded-sm p-2 hover:bg-gray-100"
              >
                <ArrowLeft size={16} />
              </button>
              <OrderBreadCrumbs possiblePagesBreadcrumbs={itemsBreadCrumbs} />
            </div>

            <div className="flex gap-2">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="flex max-w-fit flex-col gap-1"
                >
                  <ProtectedWrapper permissionCode="permission:item-masters-edit">
                    <DropdownMenuItem className="flex items-center justify-center gap-2">
                      <span className="text-sm font-semibold">{'Status:'}</span>

                      <Switch
                        checked={statusUpdate.isActive}
                        onCheckedChange={(val) => {
                          const updatedState = { isActive: val };

                          setStatusUpdate(updatedState);

                          updateServiceMutation.mutate({
                            id: params.service_id,
                            data: updatedState, // send updated value
                          });
                        }}
                      />
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center justify-center gap-2"
                      onClick={(e) => {
                        setIsEditing((prev) => !prev);
                        e.stopPropagation();
                        setServicesToEdit(itemDetails);
                      }}
                    >
                      <Pencil size={12} />
                      {translations('ctas.edit')}
                    </DropdownMenuItem>
                  </ProtectedWrapper>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section>

          {/* Content */}
          <Tabs
            value={tab}
            onValueChange={onTabChange}
            defaultValue={'overview'}
          >
            <section className="flex justify-between gap-2">
              <TabsList className="border">
                <TabsTrigger value="overview">
                  {translations('tabs.tab1.title')}
                </TabsTrigger>
              </TabsList>
            </section>
            <TabsContent value="overview">
              <Overview
                data={overviewData}
                labelMap={overviewLabels}
                customRender={customRender}
              />
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
