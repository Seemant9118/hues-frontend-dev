import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ErrorBox from '@/components/ui/ErrorBox';

const supplyOptions = [
  { value: 'O', label: 'Outward' },
  { value: 'I', label: 'Inward' },
];

// Mappings based on the user's requirement
const subSupplyMap = {
  O: [
    { value: 1, label: 'Supply' },
    { value: 3, label: 'Export' },
    { value: 4, label: 'Job Work' },
    { value: 5, label: 'SKD/CKD' },
    { value: 6, label: 'Recipient not known' },
    { value: 7, label: 'For own Use' },
    { value: 8, label: 'Exhibition or fairs' },
    { value: 9, label: 'Line Sales' },
    { value: 10, label: 'Others' },
  ],
  I: [
    { value: 1, label: 'Supply' },
    { value: 2, label: 'Import' },
    { value: 5, label: 'SKD/CKD' },
    { value: 6, label: 'Job Work Returns' },
    { value: 7, label: 'Sales Return' },
    { value: 8, label: 'Exhibition or fairs' },
    { value: 9, label: 'For Own Use' },
    { value: 10, label: 'Others' },
  ],
};

// Document Type Mapping
// INV=Tax Invoice, BIL=Bill of Supply, BOE=Bill of Entry, CHL=Delivery Challan, OTH=Others
const docTypeMap = {
  // Outward
  'O-1': [
    { value: 'INV', label: 'Tax Invoice' },
    { value: 'BIL', label: 'Bill of Supply' },
  ], // Supply
  'O-3': [
    { value: 'INV', label: 'Tax Invoice' },
    { value: 'BIL', label: 'Bill of Supply' },
  ], // Export
  'O-4': [{ value: 'CHL', label: 'Delivery Challan' }], // Job Work
  'O-5': [
    { value: 'INV', label: 'Tax Invoice' },
    { value: 'BIL', label: 'Bill of Supply' },
    { value: 'CHL', label: 'Delivery Challan' },
  ], // SKD/CKD
  'O-6': [
    { value: 'CHL', label: 'Delivery Challan' },
    { value: 'OTH', label: 'Others' },
  ], // Recipient not known
  'O-7': [{ value: 'CHL', label: 'Delivery Challan' }], // For own Use
  'O-8': [{ value: 'CHL', label: 'Delivery Challan' }], // Exhibition or fairs
  'O-9': [{ value: 'CHL', label: 'Delivery Challan' }], // Line Sales
  'O-10': [
    { value: 'CHL', label: 'Delivery Challan' },
    { value: 'OTH', label: 'Others' },
  ], // Others

  // Inward
  'I-1': [
    { value: 'INV', label: 'Tax Invoice' },
    { value: 'BIL', label: 'Bill of Supply' },
  ], // Supply
  'I-2': [{ value: 'BOE', label: 'Bill of Entry' }], // Import
  'I-5': [
    { value: 'BOE', label: 'Bill of Entry' },
    { value: 'INV', label: 'Tax Invoice' },
    { value: 'BIL', label: 'Bill of Supply' },
    { value: 'CHL', label: 'Delivery Challan' },
  ], // SKD/CKD
  'I-6': [{ value: 'CHL', label: 'Delivery Challan' }], // Job Work Returns
  'I-7': [{ value: 'CHL', label: 'Delivery Challan' }], // Sales Return
  'I-8': [{ value: 'CHL', label: 'Delivery Challan' }], // Exhibition or fairs
  'I-9': [{ value: 'CHL', label: 'Delivery Challan' }], // For Own Use
  'I-10': [
    { value: 'CHL', label: 'Delivery Challan' },
    { value: 'OTH', label: 'Others' },
  ], // Others
};

export default function Step1Supply({ formData, setFormData, errors }) {
  const handleChange = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;

    const updates = { [key]: value };

    // Reset child fields on parent change
    if (key === 'supplyType') {
      updates.subSupplyType = '';
      updates.docType = '';
    } else if (key === 'subSupplyType') {
      updates.docType = '';
    }

    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const currentSubSupplyOptions = formData.supplyType
    ? subSupplyMap[formData.supplyType] || []
    : [];
  const currentDocTypeOptions =
    formData.supplyType && formData.subSupplyType
      ? docTypeMap[`${formData.supplyType}-${formData.subSupplyType}`] || []
      : [];

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label>
          Supply Type <span className="text-red-600">*</span>
        </Label>
        <Select
          value={formData.supplyType}
          onValueChange={(v) => handleChange('supplyType')(v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Supply" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {supplyOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors?.supplyType && <ErrorBox msg={errors.supplyType} />}
      </div>
      <div>
        <Label>
          Sub Supply Type <span className="text-red-600">*</span>
        </Label>
        <Select
          value={formData.subSupplyType}
          onValueChange={(v) => handleChange('subSupplyType')(v)}
          disabled={!formData.supplyType}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Sub Supply" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {currentSubSupplyOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors?.subSupplyType && <ErrorBox msg={errors.subSupplyType} />}
      </div>
      {formData.subSupplyType === 10 && (
        <div>
          <Label>Sub Supply Desc</Label>{' '}
          {formData.subSupplyType === 10 && (
            <span className="text-red-600">*</span>
          )}
          <Input
            value={formData.subSupplyDesc}
            onChange={(e) => handleChange('subSupplyDesc')(e)}
            disabled={formData.subSupplyType !== 10}
          />
          {errors?.subSupplyDesc && <ErrorBox msg={errors.subSupplyDesc} />}
        </div>
      )}
      <div>
        <Label>
          Document Type <span className="text-red-600">*</span>
        </Label>
        <Select
          value={formData.docType}
          onValueChange={(v) => handleChange('docType')(v)}
          disabled={!formData.subSupplyType}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {currentDocTypeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors?.docType && <ErrorBox msg={errors.docType} />}
      </div>
      <div>
        <Label>
          Document Number <span className="text-red-600">*</span>
        </Label>
        <Input
          disabled
          value={formData.docNo}
          onChange={(e) => handleChange('docNo')(e)}
        />
        {errors?.docNo && <ErrorBox msg={errors.docNo} />}
      </div>
      <div>
        <Label>
          Document Date <span className="text-red-600">*</span>
        </Label>
        <Input
          disabled
          value={formData.docDate}
          onChange={(e) => handleChange('docDate')(e)}
        />
        {errors?.docDate && <ErrorBox msg={errors.docDate} />}
      </div>
      <div>
        <Label>Transaction Type</Label>
        <Select
          disabled
          value={formData.transactionType}
          onValueChange={(v) => handleChange('transactionType')(v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select transaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={1}>Regular</SelectItem>
            <SelectItem value={2}>Bill To — Ship To</SelectItem>
            <SelectItem value={3}>Bill From — Dispatch From</SelectItem>
            <SelectItem value={4}>Combination of 2 & 3</SelectItem>
          </SelectContent>
        </Select>
        {errors?.transactionType && <ErrorBox msg={errors.transactionType} />}
      </div>
    </div>
  );
}
