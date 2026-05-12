'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import Overview from '@/components/ui/Overview';
import { Button } from '@/components/ui/button';

import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { approvedRejectGoodsMasterReq } from '@/services/Admin_Services/AdminServices';

const Goods = () => {
  const params = useParams();
  const queryClient = useQueryClient();

  const goodsId = Number(params?.good_id);

  const goodsOrdersBreadCrumbs = [
    {
      id: 1,
      name: 'Goods master',
      path: '/dashboard/admin/goods-master/goods-master',
      show: true,
    },
    {
      id: 2,
      name: 'Details',
      path: `/dashboard/admin/goods-master/goods-master/${goodsId}`,
      show: true,
    },
  ];

  // Get data from cache (frontend only)
  const goodsDetails = queryClient.getQueryData([
    'goods-master-details',
    goodsId,
  ]);

  const approvedRejectMutation = useMutation({
    mutationFn: approvedRejectGoodsMasterReq,
    onSuccess: (_res, variables) => {
      const msg =
        variables?.action === 'APPROVED'
          ? 'Goods item approved successfully'
          : 'Goods item rejected successfully';

      toast.success(msg);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  //  Handle actions (frontend only for now)
  const handleApprove = () => {
    approvedRejectMutation.mutate({
      data: {
        id: goodsId,
        action: 'APPROVED',
      },
    });
  };

  const handleReject = () => {
    approvedRejectMutation.mutate({
      data: {
        id: goodsId,
        action: 'REJECTED',
      },
    });
  };

  // UI: if no data found
  if (!goodsDetails) {
    return (
      <ProtectedWrapper permissionCode={'permission:sales-view'}>
        <Wrapper className="h-full py-2">
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <OrderBreadCrumbs
              possiblePagesBreadcrumbs={goodsOrdersBreadCrumbs}
            />
          </section>

          <div className="mt-4 flex w-full flex-col items-center justify-center rounded-md border bg-gray-50 p-6 text-center">
            <p className="text-sm font-semibold text-gray-700">
              No details found
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Please open this page from the Goods Master list page.
            </p>
          </div>
        </Wrapper>
      </ProtectedWrapper>
    );
  }

  // ✅ label mapping (you can add more keys as per your API response)
  const labelMap = {
    id: 'Goods ID',
    name: 'Goods Name',
    goodsTypeId: 'Goods Type',
    categoryId: 'Category',
    subCategoryId: 'Sub Category',
    hsnCode: 'HSN Code',
    gstPercentage: 'GST %',
    description: 'Description',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    status: 'Status',
  };

  // ✅ Filter & arrange overview data (better than dumping everything)
  const overviewData = {
    id: goodsDetails?.id,
    name: goodsDetails?.item,
    hsnCode: goodsDetails?.hsnCode,
    gstPercentage: goodsDetails?.gstRate,
    categoryId: goodsDetails?.category?.categoryName,
    subCategoryId: goodsDetails?.subCategory?.subCategoryName,
    description: goodsDetails?.description,
    status: goodsDetails?.status,
  };

  return (
    <ProtectedWrapper permissionCode={'permission:sales-view'}>
      <Wrapper className="scrollBarStyles h-full py-2">
        {/* ✅ Header */}
        <section className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white py-2">
          <div className="flex gap-2">
            <OrderBreadCrumbs
              possiblePagesBreadcrumbs={goodsOrdersBreadCrumbs}
            />
          </div>

          {/* ✅ Top-right CTAs */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleReject}
            >
              <XCircle size={16} />
              Reject
            </Button>

            <Button size="sm" className="gap-2" onClick={handleApprove}>
              <CheckCircle2 size={16} />
              Approve
            </Button>
          </div>
        </section>

        {/* ✅ Page Content */}
        <div className="mt-3 flex flex-col gap-3">
          {/* ✅ Overview Card */}
          <Overview
            data={overviewData}
            labelMap={labelMap}
            collapsible={false}
            sectionClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
          />
        </div>
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default Goods;
