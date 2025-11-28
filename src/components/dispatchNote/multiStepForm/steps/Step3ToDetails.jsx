import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ErrorBox from '@/components/ui/ErrorBox';

export default function Step3ToDetails({ formData, setFormData, errors }) {
  const handleChange = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-semibold">Consignee</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>To GSTIN</Label>
          <Input
            disabled
            value={formData.toGstin}
            onChange={(e) => handleChange('toGstin')(e)}
          />
          {errors?.toGstin && <ErrorBox msg={errors.toGstin} />}
        </div>

        <div>
          <Label>To Trd Name</Label>
          <Input
            disabled
            value={formData.toTrdName}
            onChange={(e) => handleChange('toTrdName')(e)}
          />
        </div>

        <div>
          <Label>Ship To GSTIN</Label>
          <Input
            disabled
            value={formData.shipToGSTIN}
            onChange={(e) => handleChange('shipToGSTIN')(e)}
          />
        </div>
        <div>
          <Label>Ship To Trade Name</Label>
          <Input
            disabled
            value={formData.shipToTradeName}
            onChange={(e) => handleChange('shipToTradeName')(e)}
          />
        </div>
      </div>

      <h1 className="font-semibold">Addresses</h1>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>To Pincode</Label>
          <Input
            disabled
            value={formData.toPincode}
            onChange={(e) => handleChange('toPincode')(e)}
          />
        </div>
        <div>
          <Label>To State code</Label>
          <Input
            disabled
            value={`${formData.toStateCodeName} - (${formData?.toStateCode})`}
            onChange={(e) => handleChange('toStateCodeName')(e)}
          />
        </div>

        <div>
          <Label>Act to State code</Label>
          <Input
            disabled
            value={`${formData.actToStateCodeName} - (${formData?.actToStateCode})`}
            onChange={(e) => handleChange('actToStateCodeName')(e)}
          />
        </div>
        <div>
          <Label>To Address 1</Label>
          <Input
            disabled
            value={formData.toAddr1}
            onChange={(e) => handleChange('toAddr1')(e)}
          />
        </div>
        <div>
          <Label>To Address 2</Label>
          <Input
            disabled
            value={formData.toAddr2}
            onChange={(e) => handleChange('toAddr2')(e)}
          />
        </div>
        <div>
          <Label>To Place</Label>
          <Input
            disabled
            value={`${formData.toPlaceName} - (${formData?.toPlace})`}
            onChange={(e) => handleChange('toPlaceName')(e)}
          />
        </div>
      </div>
    </div>
  );
}
