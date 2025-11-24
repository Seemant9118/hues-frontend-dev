import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ErrorBox from '@/components/ui/ErrorBox';

const transModeOptions = [
  { value: '1', label: 'Road' },
  { value: '2', label: 'Rail' },
  { value: '3', label: 'Air' },
  { value: '4', label: 'Ship' },
  { value: '5', label: 'In Transit' },
];

export default function Step5Transport({ formData, setFormData, errors }) {
  const handleChange = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid w-full gap-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Transport Mode</Label>
          <Select
            value={formData.transMode}
            onValueChange={(v) => handleChange('transMode')(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {transModeOptions.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Transporter ID (GSTIN/TRANSIN)</Label>
          <Input
            value={formData.transporterId}
            onChange={(e) => handleChange('transporterId')(e)}
          />
        </div>
        <div>
          <Label>Transport Distance (KM)</Label>
          <Input
            value={formData.transDistance}
            onChange={(e) => handleChange('transDistance')(e)}
          />
        </div>
        <div>
          <Label>Transport Doc No</Label>
          <Input
            value={formData.transDocNo}
            onChange={(e) => handleChange('transDocNo')(e)}
          />
          {errors?.transDocNo && <ErrorBox msg={errors.transDocNo} />}
        </div>
        <div>
          <Label>Transport Doc Date</Label>
          <Input
            type="date"
            value={formData.transDocDate}
            onChange={(e) => handleChange('transDocDate')(e)}
          />
        </div>
        <div>
          <Label>Vehicle Type</Label>
          <Input
            value={formData.vehicleType}
            onChange={(e) => handleChange('vehicleType')(e)}
            placeholder="Vehicle Type"
          />
        </div>
        <div>
          <Label>Vehicle No (Part B)</Label>
          <Input
            value={formData.vehicleNo}
            onChange={(e) => handleChange('vehicleNo')(e)}
            placeholder="(Update in Part B)"
          />
        </div>
      </div>

      <div className="mt-4 w-full">
        <Label>Remarks</Label>
        <Textarea
          value={formData.remarks}
          onChange={(e) => handleChange('remarks')(e)}
          className="min-h-[80px]"
          placeholder="Enter remarks"
        />
      </div>
    </div>
  );
}
