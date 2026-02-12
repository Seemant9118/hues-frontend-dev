'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import ItemTypeHeader from '@/components/inventory/goods/ItemTypeHeader';
import { useAddedProductColumns } from '@/components/inventory/goods/addproductsColumns';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import ErrorBox from '@/components/ui/ErrorBox';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import {
  CreateProductGoods,
  getItemType,
} from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const EditProduct = dynamic(() => import('@/components/inventory/AddGoods'), {
  loading: () => <Loading />,
});

export default function ItemTypeDetails() {
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const queryClient = useQueryClient();
  // const router = useRouter();
  const params = useParams();
  const itemTypeId = Array.isArray(params?.item_type_id)
    ? params.item_type_id[0]
    : params?.item_type_id;

  const [formData, setFormData] = useState({
    skuId: '',
    productName: '',
    salesPrice: '',
    mrp: '',
  });
  const [isMrpSameAsSales, setIsMrpSameAsSales] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productsToEdit, setProductsToEdit] = useState();

  const addProductsBreadCrumbs = [
    {
      id: 1,
      name: 'Item Master',
      path: '/dashboard/inventory/goods/',
      show: true, // Always show
    },
    {
      id: 2,
      name: 'Item Master Builder',
      path: '/dashboard/inventory/goods/item-master-builder',
      show: true, // Always show
    },
    {
      id: 3,
      name: 'Add Products',
      path: `/dashboard/inventory/goods/item-master-builder/${itemTypeId}`,
      show: true, // Always show
    },
  ];

  const { data: itemTypeDetails } = useQuery({
    queryKey: [goodsApi.getItemType.endpointKey, itemTypeId],
    queryFn: () => getItemType({ id: itemTypeId }),
    select: (res) => res.data.data,
    enabled: !!itemTypeId,
  });
  const goodsHsnMasterDetails = itemTypeDetails?.goodsHsnMaster;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'salesPrice' && isMrpSameAsSales) {
        updated.mrp = value;
      }

      return updated;
    });

    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleMrpCheckbox = (checked) => {
    setIsMrpSameAsSales(checked);

    setFormData((prev) => ({
      ...prev,
      mrp: checked ? prev.salesPrice : '',
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.skuId.trim()) {
      newErrors.skuId = 'SKU ID is required';
    }

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.salesPrice) {
      newErrors.salesPrice = 'Sales price is required';
    }

    if (!formData.mrp) {
      newErrors.mrp = 'MRP is required';
    }

    if (
      formData.salesPrice &&
      formData.mrp &&
      Number(formData.mrp) < Number(formData.salesPrice)
    ) {
      newErrors.mrp = 'MRP cannot be less than Sales Price';
    }

    return newErrors;
  };

  const addMutation = useMutation({
    mutationFn: CreateProductGoods,
    onSuccess: () => {
      toast.success('Product added for this Item Successfully');
      setFormData({
        skuId: '',
        productName: '',
        salesPrice: '',
        mrp: '',
      });
      setIsMrpSameAsSales(false);
      setErrors({});
      queryClient.invalidateQueries({
        queryKey: [goodsApi.getItemType.endpointKey, itemTypeId],
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!itemTypeDetails?.goodsHsnMaster?.id) {
      toast.error('Invalid HSN Master');
      return;
    }

    const payload = {
      skuId: formData.skuId.trim(),
      productName: formData.productName.trim(),
      salesPrice: Number(formData.salesPrice),
      mrp: Number(formData.mrp),
      enterpriseId: Number(enterpriseId),
      goodsTypeId: Number(itemTypeId),
      goodsHsnMasterId: Number(itemTypeDetails.goodsHsnMaster.id),
      description: itemTypeDetails?.description || '',
      hsnCode: itemTypeDetails?.goodsHsnMaster?.hsnCode,
      gstPercentage: itemTypeDetails?.goodsHsnMaster?.gstRate,
    };

    addMutation.mutate(payload);
  };

  const handleReset = () => {
    setFormData({
      skuId: '',
      productName: '',
      salesPrice: '',
      mrp: '',
    });
    setIsMrpSameAsSales(false);
    setErrors({});
  };

  const addedProductColumns = useAddedProductColumns({
    setIsEditingProduct,
    setProductsToEdit,
    goodsHsnMasterDetails,
  });

  return (
    <Wrapper className="flex h-full flex-col gap-2 py-2">
      {!isEditingProduct && (
        <section className="flex flex-col gap-2">
          {/* header */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <OrderBreadCrumbs
              possiblePagesBreadcrumbs={addProductsBreadCrumbs}
            />
          </section>
          {/* item type info */}
          <ItemTypeHeader
            title={itemTypeDetails?.goodsHsnMaster?.category?.categoryName}
            status="Active"
            hsn={itemTypeDetails?.goodsHsnMaster?.hsnCode}
            categoryPath={[
              itemTypeDetails?.goodsHsnMaster?.category?.categoryName ?? '',
              itemTypeDetails?.goodsHsnMaster?.subCategory?.subCategoryName ??
                '',
            ].filter(Boolean)}
          />

          {/* quick add */}
          <div className="space-y-6 rounded-xl border border-primary bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="rounded-sm bg-blue-100 p-2">
                <Plus size={18} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Quick Add Product</h2>
                <p className="text-sm text-gray-500">
                  Add products rapidly under this item type
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-2 gap-6">
              {/* SKU */}
              <div className="col-span-1">
                <Label className="mb-1 block text-sm font-medium">
                  SKU ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="skuId"
                  value={formData.skuId}
                  onChange={handleChange}
                  placeholder="e.g., SHAM-001"
                />
                {errors.skuId && <ErrorBox msg={errors.skuId} />}
              </div>

              {/* Product Name */}
              <div className="col-span-1">
                <Label className="mb-1 block text-sm font-medium">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="e.g., Head & Shoulders Shampoo"
                />
                {errors.productName && <ErrorBox msg={errors.productName} />}
              </div>

              {/* Sales Price */}
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  Sales Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  name="salesPrice"
                  value={formData.salesPrice}
                  onChange={handleChange}
                  placeholder="Enter sales price"
                />
                {errors.salesPrice && <ErrorBox msg={errors.salesPrice} />}
              </div>

              {/* MRP */}
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  MRP <span className="text-red-500">*</span>
                </Label>

                <Input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  placeholder="Enter MRP"
                  disabled={isMrpSameAsSales}
                />

                {errors.mrp && <ErrorBox msg={errors.mrp} />}

                {/* Checkbox */}
                {formData.salesPrice && (
                  <div className="mt-2 flex items-center gap-2">
                    <Checkbox
                      id="sameAsSales"
                      checked={isMrpSameAsSales}
                      onCheckedChange={(checked) =>
                        handleMrpCheckbox(checked === true)
                      }
                    />
                    <Label
                      htmlFor="sameAsSales"
                      className="cursor-pointer text-sm text-gray-600"
                    >
                      Same as Sales Price
                    </Label>
                  </div>
                )}
              </div>
            </div>
            {/* Save Button */}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={addMutation?.isPending}
              >
                Save Product
              </Button>
            </div>
          </div>

          {/* products */}
          <DataTable
            data={itemTypeDetails?.products ?? []}
            columns={addedProductColumns}
          />
        </section>
      )}

      {isEditingProduct && (
        <EditProduct
          setIsCreatingGoods={setIsEditingProduct}
          goodsToEdit={productsToEdit}
        />
      )}
    </Wrapper>
  );
}
