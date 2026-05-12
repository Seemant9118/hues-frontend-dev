import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrappers/Wrapper';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import ErrorBox from '@/components/ui/ErrorBox';
import { toast } from 'sonner';
import ItemTypeHeader from './ItemTypeHeader';
import { useAddedProductColumns } from './addproductsColumns';

export default function AddProducts({
  itemTypeReference,
  hsnCode = '330510',
  onSave,
  isAddingProducts,
}) {
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    skuId: '',
    productName: '',
    salesPrice: '',
    mrp: '',
  });
  const [isMrpSameAsSales, setIsMrpSameAsSales] = useState(false);
  const [errors, setErrors] = useState({});

  const addProductsBreadCrumbs = [
    {
      id: 1,
      name: 'Item Master',
      path: '/dashboard/inventory/goods',
      show: true, // Always show
    },
    {
      id: 2,
      name: 'Add Products',
      path: `/dashboard/inventory/goods`,
      show: isAddingProducts, // Always show
    },
  ];

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

  const handleSubmit = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        ...formData,
        hsnCode,
        salesPrice: Number(formData.salesPrice),
        mrp: Number(formData.mrp),
      };

      let savedProduct = payload;

      if (onSave) {
        const response = await onSave(payload);
        savedProduct = response?.data ?? payload;
      }

      setProducts((prev) => [
        ...prev,
        {
          id: savedProduct?.id ?? Date.now(),
          ...savedProduct,
        },
      ]);

      // Reset form properly
      setFormData({
        skuId: '',
        productName: '',
        salesPrice: '',
        mrp: '',
      });

      setIsMrpSameAsSales(false);
      setErrors({});
    } catch (error) {
      toast.error('Error saving product:', error);
    }
  };

  const addedProductsColumns = useAddedProductColumns();

  return (
    <Wrapper className="flex h-full flex-col gap-2 py-2">
      {/* header */}
      <OrderBreadCrumbs possiblePagesBreadcrumbs={addProductsBreadCrumbs} />

      {/* item type info */}
      <ItemTypeHeader
        title={itemTypeReference?.category?.categoryName || 'Category'}
        status="Active"
        hsn={itemTypeReference?.hsnCode}
        categoryPath={[
          itemTypeReference?.category?.categoryName,
          itemTypeReference?.subCategory?.subCategoryName,
        ]}
      />

      {/* quick add */}
      <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Plus size={18} className="text-blue-600" />
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
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isMrpSameAsSales}
                onChange={(e) => handleMrpCheckbox(e.target.checked)}
                className="h-4 w-4 cursor-pointer"
              />
              <label className="cursor-pointer text-sm text-gray-600">
                Same as Sales Price
              </label>
            </div>
          </div>
        </div>
        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSubmit}>
            Save Product
          </Button>
        </div>
      </div>

      <DataTable data={products} columns={addedProductsColumns} />
    </Wrapper>
  );
}
