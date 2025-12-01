import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/table/data-table';
import { useEWBItemColumns } from '../../EWB-items-columns';

export default function Step4Items({ formData, setFormData, errors }) {
  const handleChange = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const EWBItemColumns = useEWBItemColumns();

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-xl">Items</Label>
        <div className="text-sm text-muted-foreground">
          {formData?.itemList?.length} item(s)
        </div>
      </div>

      <DataTable data={formData?.itemList || []} columns={EWBItemColumns} />

      {errors?.itemList && (
        <p className="text-sm text-destructive">{errors.itemList}</p>
      )}

      <div className="mt-6 grid w-full grid-cols-3 gap-4">
        <div>
          <Label>Total Invoice Value</Label>
          <Input
            disabled
            value={formData?.totInvValue}
            onChange={(e) => handleChange('totInvValue')(e)}
          />
        </div>
        <div>
          <Label>Total Value</Label>
          <Input
            disabled
            value={formData?.totalValue}
            onChange={(e) => handleChange('totalValue')(e)}
          />
        </div>
        <div>
          <Label>CGST Rate</Label>
          <Input
            disabled
            value={formData?.cgstValue}
            onChange={(e) => handleChange('cgstValue')(e)}
          />
        </div>
        <div>
          <Label>SGST Rate</Label>
          <Input
            disabled
            value={formData?.sgstValue}
            onChange={(e) => handleChange('sgstValue')(e)}
          />
        </div>
        <div>
          <Label>IGST Rate</Label>
          <Input
            disabled
            value={formData?.igstValue}
            onChange={(e) => handleChange('igstValue')(e)}
          />
        </div>
        <div>
          <Label>CESS Rate</Label>
          <Input
            disabled
            value={formData?.cessValue}
            onChange={(e) => handleChange('cessValue')(e)}
          />
        </div>
        <div>
          <Label>CESS Non Advol Value </Label>
          <Input
            disabled
            value={formData?.cessNonAdvolValue}
            onChange={(e) => handleChange('cessNonAdvolValue')(e)}
          />
        </div>
      </div>
    </div>
  );
}
