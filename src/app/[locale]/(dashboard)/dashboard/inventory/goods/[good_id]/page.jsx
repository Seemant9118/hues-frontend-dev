'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import { formattedAmount } from '@/appUtils/helperFunctions';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import Overview from '@/components/ui/Overview';
import { TruncateAndShowInfo } from '@/components/ui/TruncateAndShowInfo';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import {
  DeleteProductGoods,
  GetProductGoods,
} from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';

const EditGoods = dynamic(() => import('@/components/inventory/AddGoods'), {
  loading: () => <Loading />,
});

const ViewItem = () => {
  useMetaData('Hues! - Goods Details', 'HUES Goods Details');
  const translations = useTranslations('goods.goodDetails');
  const router = useRouter();
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [goodsToEdit, setGoodsToEdit] = useState(null);

  const itemsBreadCrumbs = [
    {
      id: 1,
      name: translations('title.items'),
      path: '/dashboard/inventory/goods',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title.item_details'),
      path: `/dashboard/inventory/goods/${params.good_id}`,
      show: true, // Always show
    },
  ];

  // item details fetching
  const { data: itemDetails } = useQuery({
    queryKey: [goodsApi.getProductGoods.endpointKey, params.good_id],
    queryFn: () => GetProductGoods(params.good_id),
    select: (res) => res.data.data,
    enabled: true,
  });

  const productInfoData = {
    productName: itemDetails?.productName,
    skuId: itemDetails?.skuId || 'Not available',
    huesId: itemDetails?.huesId || 'Not available',
    createdAt: moment(itemDetails?.createdAt).format('DD-MM-YYYY'),
    updatedAt: moment(itemDetails?.updatedAt).format('DD-MM-YYYY'),
    description: itemDetails?.description,
  };

  const productInfoLabel = {
    productName: translations('overview_labels.productName'),
    skuId: translations('overview_labels.skuId'),
    huesId: translations('overview_labels.huesId'),
    createdAt: translations('overview_labels.createdAt'),
    updatedAt: translations('overview_labels.updatedAt'),
    description: translations('overview_labels.description'),
  };

  const customRender = {
    description: (value) => <TruncateAndShowInfo text={value} />,
  };

  const pricingData = {
    salesPrice: formattedAmount(itemDetails?.salesPrice),
    mrp: formattedAmount(itemDetails?.mrp),
    unit: itemDetails?.unit || 'Not available',
  };
  const pricingLabel = {
    salesPrice: translations('overview_labels.salesPrice'),
    mrp: translations('overview_labels.mrp'),
    unit: 'Unit',
  };

  const taxComplianceData = {
    hsnCode: itemDetails?.hsnCode,
    gstPercentage: `${itemDetails?.gstPercentage}%`,
  };
  const taxComplianceLabel = {
    hsnCode: translations('overview_labels.hsnCode'),
    gstPercentage: translations('overview_labels.gstPercentage'),
  };

  return (
    <ProtectedWrapper permissionCode={'permission:item-masters-view'}>
      {!isEditing && (
        <Wrapper className="h-full py-1">
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
              <ProtectedWrapper permissionCode="permission:item-masters-edit">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    setIsEditing((prev) => !prev);
                    e.stopPropagation();
                    setGoodsToEdit(itemDetails);
                  }}
                >
                  <Pencil size={12} />
                  {translations('ctas.edit')}
                </Button>
              </ProtectedWrapper>
              <ProtectedWrapper permissionCode="permission:item-masters-delete">
                <ConfirmAction
                  deleteCta={translations('ctas.delete')}
                  infoText={translations('ctas.infoText', {
                    name: itemDetails?.productName,
                  })}
                  cancelCta={translations('ctas.cancel')}
                  id={itemDetails?.id}
                  mutationKey={goodsApi.getAllProductGoods.endpointKey}
                  mutationFunc={DeleteProductGoods}
                  successMsg={translations('ctas.successMsg')}
                  invalidateKey={goodsApi.getAllProductGoods.endpointKey}
                  redirectedTo={() => router.push('/dashboard/inventory/goods')}
                />
              </ProtectedWrapper>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            {/* BASIC INFORMATION */}
            <section className="flex flex-col gap-0.5 px-2">
              <h1 className="text-xl font-semibold text-primary">
                Basic Information
              </h1>
              <span className="text-sm text-gray-400">
                Core product details
              </span>
            </section>

            <Overview
              sectionClass="grid grid-cols-1 md:grid-cols-3 gap-6"
              data={productInfoData}
              labelMap={productInfoLabel}
              customRender={customRender}
            />

            {/* PRICING */}
            <section className="flex flex-col gap-0.5 px-2">
              <h1 className="text-xl font-semibold text-primary">Pricing</h1>
              <span className="text-sm text-gray-400">
                Sales price and MRP details
              </span>
            </section>

            <Overview
              sectionClass="grid grid-cols-1 md:grid-cols-3 gap-6"
              data={pricingData}
              labelMap={pricingLabel}
            />

            {/* TAX & COMPLIANCE */}
            <section className="flex flex-col gap-0.5 px-2">
              <h1 className="text-xl font-semibold text-primary">
                Tax & Compliance
              </h1>
              <span className="text-sm text-gray-400">
                Auto-derived from HSN {itemDetails?.hsnCode} mapping
              </span>
            </section>

            <Overview
              sectionClass="grid grid-cols-1 md:grid-cols-3 gap-6"
              data={taxComplianceData}
              labelMap={taxComplianceLabel}
            />
          </section>
        </Wrapper>
      )}
      {isEditing && (
        <EditGoods
          setIsCreatingGoods={setIsEditing}
          goodsToEdit={goodsToEdit}
        />
      )}
    </ProtectedWrapper>
  );
};

export default ViewItem;
