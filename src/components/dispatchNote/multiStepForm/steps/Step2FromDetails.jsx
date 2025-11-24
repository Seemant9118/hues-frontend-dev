import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

export default function Step2FromDetails({ formData, setFormData, errors }) {
  const handleChange = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label>From GSTIN</Label>
        <Input
          disabled
          value={formData.fromGstin}
          onChange={(e) => handleChange('fromGstin')(e)}
        />
        {errors?.fromGstin && <ErrorBox msg={errors.fromGstin} />}
      </div>
      <div>
        <Label>From Pincode</Label>
        <Input
          disabled
          value={formData.fromPincode}
          onChange={(e) => handleChange('fromPincode')(e)}
        />
      </div>
      <div>
        <Label>From State code</Label>
        <Input
          disabled
          value={formData.fromStateCode}
          onChange={(e) => handleChange('fromStateCode')(e)}
        />
      </div>
      <div>
        <Label>From Trd Name</Label>
        <Input
          disabled
          value={formData.fromTrdName}
          onChange={(e) => handleChange('fromTrdName')(e)}
        />
      </div>
      <div>
        <Label>Act from State code</Label>
        <Input
          disabled
          value={formData.actFromStateCode}
          onChange={(e) => handleChange('actFromStateCode')(e)}
        />
      </div>
      <div>
        <Label>From Address 1</Label>
        <Input
          value={formData.fromAddr1}
          onChange={(e) => handleChange('fromAddr1')(e)}
        />
      </div>
      <div>
        <Label>From Address 2</Label>
        <Input
          value={formData.fromAddr2}
          onChange={(e) => handleChange('fromAddr2')(e)}
        />
      </div>
      <div>
        <Label>From Place</Label>
        <Input
          value={formData.fromPlace}
          onChange={(e) => handleChange('fromPlace')(e)}
        />
      </div>
      <div>
        <Label>Dispatch From GSTIN</Label>
        <Input
          value={formData.dispatchFromGSTIN}
          onChange={(e) => handleChange('dispatchFromGSTIN')(e)}
        />
      </div>
      <div>
        <Label>Dispatch From Trade Name</Label>
        <Input
          value={formData.dispatchFromTradeName}
          onChange={(e) => handleChange('dispatchFromTradeName')(e)}
        />
      </div>
    </div>
  );
}
