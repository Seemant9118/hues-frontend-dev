import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import InputWithSelect from '@/components/ui/InputWithSelect';
import { Label } from '@/components/ui/label';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

export default function AdditionalInfo({
  formData,
  setFormData,
  errors,
  translation,
}) {
  // fetch units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
  });

  const handleChange = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;

    const updates = { [key]: value };

    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.additionalInfo.section1.title')}
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Sales Price</Label> <span className="text-red-600">*</span>
          <Input
            placeholder="0.00"
            type="number"
            value={formData?.salesPrice}
            onChange={(e) => handleChange('salesPrice')(e)}
          />
          {errors?.salesPrice && <ErrorBox msg={errors?.salesPrice} />}
        </div>

        {/* <div>
          <Label>Cost Price</Label> <span className="text-red-600">*</span>
          <Input
            placeholder="0.00"
            type="number"
            value={formData?.costPrice}
            onChange={(e) => handleChange('costPrice')(e)}
          />
          {errors?.costPrice && <ErrorBox msg={errors?.costPrice} />}
        </div> */}

        <div>
          <Label>MRP</Label> <span className="text-red-600">*</span>
          <Input
            placeholder="0.00"
            type="number"
            value={formData?.mrp}
            onChange={(e) => handleChange('mrp')(e)}
          />
          {errors?.mrp && <ErrorBox msg={errors?.mrp} />}
        </div>
      </div>

      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.additionalInfo.section2.title')}
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <InputWithSelect
          id="weight"
          name={'Weight'}
          value={formData?.weight}
          onValueChange={(e) => handleChange('weight')(e)}
          unit={formData?.weightUnitId} // auto-selected from state
          onUnitChange={(e) => handleChange('weightUnitId')(e)}
          units={units?.mass} // pass full object list like [{id: 1, name: 'kg'}]
        />

        <InputWithSelect
          id="height"
          name={'Height'}
          value={formData?.height}
          onValueChange={(e) => handleChange('height')(e)}
          unit={formData?.heightUnitId}
          onUnitChange={(e) => handleChange('heightUnitId')(e)}
          units={units?.length}
        />

        <InputWithSelect
          id="length"
          name={'Length'}
          value={formData?.length}
          onValueChange={(e) => handleChange('length')(e)}
          unit={formData?.lengthUnitId}
          onUnitChange={(e) => handleChange('lengthUnitId')(e)}
          units={units?.length}
        />

        <InputWithSelect
          id="breadth"
          name={'Breadth'}
          value={formData?.breadth}
          onValueChange={(e) => handleChange('breadth')(e)}
          unit={formData?.breadthUnitId}
          onUnitChange={(e) => handleChange('breadthUnitId')(e)}
          units={units?.length}
        />
      </div>
    </div>
  );
}
