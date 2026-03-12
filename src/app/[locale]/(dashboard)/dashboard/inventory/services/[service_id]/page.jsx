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
import moment from 'moment';

const EditService = dynamic(
  () => import('@/components/inventory/services/CreateService'),
  {
    loading: () => <Loading />,
  },
);

const ViewService = () => {
  useMetaData('Hues! - Services Details', 'HUES Services Details');
  const translations = useTranslations('services.serviceDetails');
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
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
    {
      id: 3,
      name: translations('title.edit_item'),
      path: `/dashboard/inventory/services/${params.service_id}?action=edit`,
      show: isEditing, // Only show when editing
    },
  ];

  // item details fetching
  const { data: itemDetails } = useQuery({
    queryKey: [servicesApi.getProductServices.endpointKey, params.service_id],
    queryFn: () => GetProductServices(params.service_id),
    select: (res) => res.data.data,
    enabled: true,
  });

  const basicInfoData = {
    serviceName: itemDetails?.serviceName
      ? capitalize(itemDetails?.serviceName)
      : '--',
    serviceCode: itemDetails?.serviceCode || '--',
    serviceCategory: itemDetails?.serviceCategory?.serviceTypeName
      ? capitalize(itemDetails?.serviceCategory?.serviceTypeName)
      : '--',
    serviceSubType: itemDetails?.serviceSubType?.serviceSubTypeName
      ? capitalize(itemDetails?.serviceSubType?.serviceSubTypeName)
      : '--',
    createdAt: itemDetails?.createdAt
      ? moment(itemDetails?.createdAt).format('DD-MM-YYYY')
      : '--',
    updatedAt: itemDetails?.updatedAt
      ? moment(itemDetails?.updatedAt).format('DD-MM-YYYY')
      : '--',
    status: itemDetails?.isActive,
  };

  const basicInfoLabels = {
    serviceName: 'Service Name',
    serviceCode: 'Service Code',
    serviceCategory: 'Service Category',
    serviceSubType: 'Service Sub-Type',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    status: 'Status',
  };

  const pricingData = {
    basePrice: itemDetails?.basePrice
      ? formattedAmount(itemDetails?.basePrice)
      : '--',
    pricingModel: itemDetails?.config?.pricing_model?.defaultValue
      ? capitalize(itemDetails?.config?.pricing_model?.defaultValue)
      : '--',
  };

  const pricingLabels = {
    basePrice: 'Base Price',
    pricingModel: 'Pricing Model',
  };

  const taxComplianceData = {
    sacCode: itemDetails?.config?.sac_hsn_code?.defaultValue || '--',
    gstPercentage: itemDetails?.config?.gst_rate_percent?.defaultValue
      ? `${itemDetails?.config?.gst_rate_percent?.defaultValue}%`
      : '--',
  };

  const taxComplianceLabels = {
    sacCode: 'SAC Code',
    gstPercentage: 'GST Percentage',
  };

  const operationsData = {
    unitOfMeasure: itemDetails?.config?.unit_of_measure?.defaultValue
      ? convertSnakeToTitleCase(
          itemDetails?.config?.unit_of_measure?.defaultValue,
        )
      : '--',
    deliveryMode: itemDetails?.config?.delivery_mode?.defaultValue
      ? convertSnakeToTitleCase(
          itemDetails?.config?.delivery_mode?.defaultValue,
        )
      : '--',
    defaultDuration: itemDetails?.config?.default_duration_minutes?.defaultValue
      ? `${itemDetails?.config?.default_duration_minutes?.defaultValue} Minutes`
      : '--',
    locationRequirements:
      itemDetails?.config?.location_requirements?.defaultValue || '--',
  };

  const operationsLabels = {
    unitOfMeasure: 'Unit of Measure',
    deliveryMode: 'Delivery Mode',
    defaultDuration: 'Default Duration',
    locationRequirements: 'Location Requirements',
  };

  const descriptionData = {
    shortDescription: itemDetails?.config?.short_description?.defaultValue
      ? capitalize(itemDetails?.config?.short_description?.defaultValue)
      : '--',
    longDescription: itemDetails?.config?.long_description?.defaultValue
      ? capitalize(itemDetails?.config?.long_description?.defaultValue)
      : '--',
  };

  const descriptionLabels = {
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
              <ProtectedWrapper permissionCode="permission:item-masters-delete">
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
              </ProtectedWrapper>
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
          <section className="flex flex-col gap-3 py-2">
            {/* BASIC INFORMATION */}
            <section className="flex flex-col gap-0.5 px-2">
              <h1 className="text-xl font-semibold text-primary">
                Basic Information
              </h1>
              <span className="text-sm text-gray-400">
                Core service details
              </span>
            </section>

            <Overview
              sectionClass="grid grid-cols-1 md:grid-cols-3 gap-6"
              data={basicInfoData}
              labelMap={basicInfoLabels}
              customRender={customRender}
            />

            {/* PRICING */}
            <section className="flex flex-col gap-0.5 px-2">
              <h1 className="text-xl font-semibold text-primary">Pricing</h1>
              <span className="text-sm text-gray-400">
                Base price and pricing model details
              </span>
            </section>

            <Overview
              sectionClass="grid grid-cols-1 md:grid-cols-3 gap-6"
              data={pricingData}
              labelMap={pricingLabels}
            />

            {/* TAX & COMPLIANCE */}
            <section className="flex flex-col gap-0.5 px-2">
              <h1 className="text-xl font-semibold text-primary">
                Tax & Compliance
              </h1>
              <span className="text-sm text-gray-400">
                Auto-derived from SAC Code mapping
              </span>
            </section>

            <Overview
              sectionClass="grid grid-cols-1 md:grid-cols-3 gap-6"
              data={taxComplianceData}
              labelMap={taxComplianceLabels}
            />

            {/* OPERATIONS */}
            <section className="flex flex-col gap-0.5 px-2">
              <h1 className="text-xl font-semibold text-primary">Operations</h1>
              <span className="text-sm text-gray-400">
                Delivery and operation details
              </span>
            </section>

            <Overview
              sectionClass="grid grid-cols-1 md:grid-cols-3 gap-6"
              data={operationsData}
              labelMap={operationsLabels}
            />

            {/* DESCRIPTION */}
            <section className="flex flex-col gap-0.5 px-2">
              <h1 className="text-xl font-semibold text-primary">
                Description
              </h1>
              <span className="text-sm text-gray-400">
                Additional service details
              </span>
            </section>

            <Overview
              sectionClass="grid grid-cols-1 md:grid-cols-2 gap-6"
              data={descriptionData}
              labelMap={descriptionLabels}
            />
          </section>
        </Wrapper>
      )}
      {isEditing && (
        <EditService
          createServiceBreadCrumbs={itemsBreadCrumbs}
          setIsEditing={setIsEditing}
          servicesToEdit={servicesToEdit}
        />
      )}
    </ProtectedWrapper>
  );
};

export default ViewService;
