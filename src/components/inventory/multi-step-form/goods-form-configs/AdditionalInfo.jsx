import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import InputWithSelect from '@/components/ui/InputWithSelect';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
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

  const handleAddAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [
        ...(prev.attributes || []),
        {
          id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          attributeKey: '',
          attributeValue: '',
          categoryId: prev.categoryId || null,
        },
      ],
    }));
  };

  const handleRemoveAttribute = (id) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((attr) => attr.id !== id),
    }));
  };

  const handleAttributeChange = (id, key, value) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr) =>
        attr.id === id ? { ...attr, [key]: value } : attr,
      ),
    }));
  };

  React.useEffect(() => {
    if (formData?.attributes?.some((attr) => !attr.id)) {
      setFormData((prev) => ({
        ...prev,
        attributes: prev.attributes?.map((attr, index) => ({
          ...attr,
          id: attr.id || `attr-${index}-${Date.now()}`,
        })),
      }));
    }
  }, [formData?.attributes, setFormData]);

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

      {/* Product Attributes Section */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-primary">
            {translation('multiStepForm.additionalInfo.section3.title')}
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
            onClick={handleAddAttribute}
          >
            <Plus size={16} />
            {translation('multiStepForm.additionalInfo.section3.ctas.add')}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {formData?.attributes?.map((attr) => (
            <div key={attr?.id} className="flex items-end gap-4">
              <div className="flex-1">
                <Label>
                  {translation(
                    'multiStepForm.additionalInfo.section3.labels.attributeKey',
                  )}
                </Label>
                <Input
                  placeholder="e.g. Color"
                  value={attr.attributeKey}
                  onChange={(e) =>
                    handleAttributeChange(
                      attr?.id,
                      'attributeKey',
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="flex-1">
                <Label>
                  {translation(
                    'multiStepForm.additionalInfo.section3.labels.attributeValue',
                  )}
                </Label>
                <Input
                  placeholder="e.g. White"
                  value={attr.attributeValue}
                  onChange={(e) =>
                    handleAttributeChange(
                      attr?.id,
                      'attributeValue',
                      e.target.value,
                    )
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => handleRemoveAttribute(attr?.id)}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}

          {(!formData?.attributes || formData.attributes.length === 0) && (
            <p className="text-sm italic text-zinc-500">
              No attributes added yet. Click &quot;Add Attribute&quot; to begin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
