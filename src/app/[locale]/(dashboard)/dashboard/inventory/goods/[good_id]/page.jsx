'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import { formattedAmount } from '@/appUtils/helperFunctions';
import EditItem from '@/components/inventory/EditItem';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  DeleteProductGoods,
  GetProductGoods,
  UpdateProductGoods,
} from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';

const ViewItem = () => {
  const translations = useTranslations('goods.goodDetails');
  const router = useRouter();
  const params = useParams();
  const [tab, setTab] = useState('overview');
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

  const onTabChange = (tab) => {
    setTab(tab);
  };

  // item details fetching
  const { data: itemDetails } = useQuery({
    queryKey: [goodsApi.getProductGoods.endpointKey, params.good_id],
    queryFn: () => GetProductGoods(params.good_id),
    select: (res) => res.data.data,
    enabled: true,
  });

  const overviewData = {
    id: itemDetails?.id,
    productName: itemDetails?.productName,
    manufacturerName: itemDetails?.manufacturerName,
    manufacturerGstId: itemDetails?.manufacturerGstId,
    skuId: itemDetails?.skuId,
    hsnCode: itemDetails?.hsnCode,
    description: itemDetails?.description,
    costPrice: formattedAmount(itemDetails?.costPrice),
    salesPrice: formattedAmount(itemDetails?.salesPrice),
    mrp: formattedAmount(itemDetails?.mrp),
    gstPercentage: `${itemDetails?.gstPercentage}%`,
    cgstPercentage: itemDetails?.cgstPercentage,
    sgstPercentage: itemDetails?.sgstPercentage,
    igstPercentage: itemDetails?.igstPercentage,
    createdAt: moment(itemDetails?.createdAt).format('DD-MM-YYYY'),
    updatedAt: moment(itemDetails?.updatedAt).format('DD-MM-YYYY'),
    weight: itemDetails?.weight,
    length: itemDetails?.length,
    breadth: itemDetails?.breadth,
    height: itemDetails?.height,
  };

  const overviewLabels = {
    id: translations('overview_labels.id'),
    productName: translations('overview_labels.productName'),
    manufacturerName: translations('overview_labels.manufacturerName'),
    manufacturerGstId: translations('overview_labels.manufacturerGstId'),
    skuId: translations('overview_labels.skuId'),
    hsnCode: translations('overview_labels.hsnCode'),
    description: translations('overview_labels.description'),
    costPrice: translations('overview_labels.costPrice'),
    salesPrice: translations('overview_labels.salesPrice'),
    mrp: translations('overview_labels.mrp'),
    gstPercentage: translations('overview_labels.gstPercentage'),
    cgstPercentage: translations('overview_labels.cgstPercentage'),
    sgstPercentage: translations('overview_labels.sgstPercentage'),
    igstPercentage: translations('overview_labels.igstPercentage'),
    createdAt: translations('overview_labels.createdAt'),
    updatedAt: translations('overview_labels.updatedAt'),
    weight: translations('overview_labels.weight'), // todo : with units
    length: translations('overview_labels.length'), // todo : with units
    breadth: translations('overview_labels.breadth'), // todo : with units
    height: translations('overview_labels.height'), // todo :with units
  };

  return (
    <ProtectedWrapper permissionCode={'permission:item-masters-view'}>
      {!isEditing && (
        <Wrapper className="h-full py-2">
          {/* Headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex items-center gap-1">
              {/* breadcrumbs */}
              <button
                onClick={() => router.back()}
                className="rounded-sm p-2 hover:bg-gray-100"
              >
                <ArrowLeft size={16} />
              </button>
              <OrderBreadCrumbs possiblePagesBreadcrumbs={itemsBreadCrumbs} />
            </div>

            <div className="flex gap-2">
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
        <EditItem
          setIsEditing={setIsEditing}
          goodsToEdit={goodsToEdit}
          setGoodsToEdit={setGoodsToEdit}
          mutationFunc={UpdateProductGoods}
          queryKey={[goodsApi.getProductGoods.endpointKey, params.good_id]}
        />
      )}
    </ProtectedWrapper>
  );
};

export default ViewItem;
