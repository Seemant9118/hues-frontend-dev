'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AddProducts() {
  const [skuId, setSkuId] = useState('');
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([
    {
      id: '1',
      skuId: 'HNS-SHAM-001',
      name: 'Head & Shoulders Shampoo',
      salesPrice: 180,
      mrp: 199,
      createdOn: '15 Jan 2024',
    },
  ]);

  const handleAddProduct = async () => {
    if (!skuId || !productName) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticProduct = {
      id: tempId,
      skuId,
      name: productName,
      createdOn: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      isOptimistic: true,
    };

    // Optimistic UI update
    setProducts((prev) => [optimisticProduct, ...prev]);
    setLoading(true);

    try {
      // API call
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skuId,
          name: productName,
          hsn: '330510',
        }),
      });

      if (!res.ok) throw new Error('Failed to create product');

      const savedProduct = await res.json();

      // Replace optimistic row with real data
      setProducts((prev) =>
        prev.map((p) => (p.id === tempId ? savedProduct : p)),
      );

      setSkuId('');
      setProductName('');
    } catch (err) {
      // Rollback on failure
      setProducts((prev) => prev.filter((p) => p.id !== tempId));
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Add Product */}
      <div className="rounded-xl border bg-blue-50 p-6">
        <h3 className="mb-4 text-lg font-semibold">Quick Add Product</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            className="rounded-md border px-3 py-2"
            placeholder="e.g. SHAM-001"
            value={skuId}
            onChange={(e) => setSkuId(e.target.value)}
          />

          <Input
            className="rounded-md border px-3 py-2"
            placeholder="e.g. Head & Shoulders Shampoo"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleAddProduct}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border">
        <Table className="w-full border-collapse text-sm">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-4 py-3 text-left">SKU ID</TableHead>
              <TableHead className="px-4 py-3 text-left">
                Product Name
              </TableHead>
              <TableHead className="px-4 py-3 text-left">Sales Price</TableHead>
              <TableHead className="px-4 py-3 text-left">MRP</TableHead>
              <TableHead className="px-4 py-3 text-left">Created On</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.map((p) => (
              <TableRow
                key={p.id}
                className={`border-t ${p.isOptimistic ? 'opacity-60' : ''}`}
              >
                <TableCell className="px-4 py-3">{p.skuId}</TableCell>
                <TableCell className="px-4 py-3 font-medium">
                  {p.name}
                </TableCell>
                <TableCell className="px-4 py-3">
                  {p.salesPrice ? `₹${p.salesPrice}` : '—'}
                </TableCell>
                <TableCell className="px-4 py-3">
                  {p.mrp ? `₹${p.mrp}` : '—'}
                </TableCell>
                <TableCell className="px-4 py-3">{p.createdOn}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
