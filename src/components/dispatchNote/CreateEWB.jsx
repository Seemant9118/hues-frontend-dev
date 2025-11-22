'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useState } from 'react';
import OrderBreadCrumbs from '../orders/OrderBreadCrumbs';
import ErrorBox from '../ui/ErrorBox';
import Overview from '../ui/Overview';
import Wrapper from '../wrappers/Wrapper';
import { DataTable } from '../table/data-table';
import { useEWBItemColumns } from './EWB-items-columns';

// Mock utils (replace with real API calls)
const mockInvoice = {
  id: 'INV/NWYC15/2526/0027',
  consignor: 'Kamlapuri tech - by surepass',
  consignee: 'suman ki company',
  docNo: 'INV-2025-0027',
  docDate: '2025-11-01',
  fromGstin: '29ABCDE1234F2Z5',
  toGstin: '09XYZAB1234C1Z0',
  fromPincode: '110001',
  toPincode: '560001',
  itemList: [
    {
      id: 1,
      hsnCode: 'AJDHJ342',
      taxableAmount: '500',
      productName: 'Test Product name',
      productDesc: 'Test Product Desc',
      quantity: '15',
      qtyUnit: '5',
      sgstRate: '5',
      cgstRate: '5',
      igstRate: '5',
      cessRate: '5',
    },
  ],
  totInvValue: 1200,
};

const supplyOptions = [
  { value: 'O', label: 'Outward' },
  { value: 'I', label: 'Inward' },
];

const subSupplyOptions = [
  { value: '1', label: 'Supply' },
  { value: '2', label: 'Import' },
  { value: '3', label: 'Export' },
  { value: '8', label: 'Others' },
];

const transModeOptions = [
  { value: '1', label: 'Road' },
  { value: '2', label: 'Rail' },
  { value: '3', label: 'Air' },
  { value: '4', label: 'Ship' },
  { value: '5', label: 'In Transit' },
];

export default function CreateEWB({
  overviewData,
  overviewLabels,
  customRender,
  customLabelRender,
  dispatchOrdersBreadCrumbs,
  setIsCreatingEWB,
}) {
  const [form, setForm] = useState(() => ({
    supplyType: '',
    subSupplyType: '',
    subSupplyDesc: '',
    docType: '',
    docNo: '',
    docDate: '',
    fromGstin: '',
    fromPincode: '',
    fromStateCode: '',
    fromTrdName: '',
    actFromStateCode: '',
    toGstin: '',
    toPincode: '',
    toStateCode: '',
    toTrdName: '',
    actToStateCode: '',
    transactionType: '', // ?
    fromAddr1: '',
    fromAddr2: '',
    fromPlace: '',
    toAddr1: '',
    toAddr2: '',
    toPlace: '',
    dispatchFromGSTIN: '',
    dispatchFromTradeName: '',
    shipToGSTIN: '',
    shipToTradeName: '',
    itemList: [],
    totInvValue: 0,
    totalValue: 0,
    cgstValue: '',
    sgstValue: '',
    igstValue: '',
    cessValue: '',
    cessNonAdvolValue: '',
    transMode: '',
    transporterId: '',
    transporterName: '',
    transDistance: '',
    transDocNo: '',
    transDocDate: '',
    vehicleNo: '',
    vehicleType: '',
    remarks: '', // option
  }));

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-populate from mock invoice on mount
  useEffect(() => {
    const inv = mockInvoice;
    setForm((s) => ({
      ...s,
      docNo: inv.docNo,
      docDate: inv.docDate,
      fromGstin: inv.fromGstin,
      toGstin: inv.toGstin,
      fromPincode: inv.fromPincode,
      toPincode: inv.toPincode,
      itemList: inv.itemList,
      totInvValue: inv.totInvValue,
      totalValue: inv.itemList.reduce((a, b) => a + (b.taxableValue || 0), 0),
    }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.supplyType) e.supplyType = 'Select supply type';
    if (!form.subSupplyType) e.subSupplyType = 'Select sub supply type';
    if (!form.docType) e.docType = 'Select document type';
    if (!form.docNo) e.docNo = 'Document number is required';
    if (!form.docDate) e.docDate = 'Document date is required';
    else {
      const docDate = new Date(form.docDate);
      const today = new Date();
      if (docDate > today) e.docDate = 'Document date cannot be in future';
      const diffDays = Math.floor((today - docDate) / (1000 * 60 * 60 * 24));
      if (diffDays > 180) e.docDate = 'Document date should be within 180 days';
    }

    if (!form.fromGstin) e.fromGstin = 'From GSTIN required';
    if (!form.toGstin) e.toGstin = 'To GSTIN required';
    if (!form.itemList || form.itemList.length === 0)
      e.itemList = 'At least one item required';

    // Trans mode specific
    if (form.transMode !== '1' && !form.transDocNo) {
      e.transDocNo = 'Transport document number required for selected mode';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleSubmit = async (type = 'save') => {
    if (!validate()) return;
    setSubmitting(true);
    // Mock API call
    await new Promise((r) => {
      setTimeout(r, 600);
    });

    // Example duplicate docNo check - replace with real API call
    if (form.docNo === 'DUPLICATE') {
      setErrors({
        docNo: 'Duplicate e-way bill exists for this document number',
      });
      setSubmitting(false);
      return;
    }

    // Build payload
    const payload = { ...form };
    // eslint-disable-next-line no-console
    console.log('E-Waybill payload ->', payload);

    setSubmitting(false);
    // eslint-disable-next-line no-alert
    alert(
      type === 'save' ? 'Saved as draft (mock)' : 'Generated E-Way bill (mock)',
    );
  };

  const EWBItemColumns = useEWBItemColumns();

  return (
    <Wrapper className="flex h-full flex-col justify-between">
      {/* HEADER */}
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <OrderBreadCrumbs
          possiblePagesBreadcrumbs={dispatchOrdersBreadCrumbs}
        />
      </section>
      {/* Collapsable overview */}
      <Overview
        collapsible={true}
        data={overviewData}
        labelMap={overviewLabels}
        customRender={customRender}
        customLabelRender={customLabelRender}
      />
      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create E-Way Bill (Part A)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {/* Supply Row */}
          <div>
            <Label>
              Supply Type <span className="text-red-600">*</span>
            </Label>
            <Select onValueChange={(v) => handleChange('supplyType')(v)}>
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
            {errors.supplyType && <ErrorBox msg={errors.supplyType} />}
          </div>
          <div>
            <Label>
              Sub Supply Type <span className="text-red-600">*</span>
            </Label>
            <Select onValueChange={(v) => handleChange('subSupplyType')(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Sub Supply" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {subSupplyOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.subSupplyType && <ErrorBox msg={errors.subSupplyType} />}
          </div>
          <div>
            <Label>
              Document Type <span className="text-red-600">*</span>
            </Label>
            <Select onValueChange={(v) => handleChange('docType')(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="INV / CHL / BIL / BOE / OTH" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="INV">INV</SelectItem>
                  <SelectItem value="CHL">CHL</SelectItem>
                  <SelectItem value="BIL">BIL</SelectItem>
                  <SelectItem value="BOE">BOE</SelectItem>
                  <SelectItem value="OTH">OTH</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.docType && <ErrorBox msg={errors.docType} />}
          </div>
          <div>
            <Label>
              Document Number <span className="text-red-600">*</span>
            </Label>
            <Input
              value={form.docNo}
              onChange={(e) => handleChange('docNo')(e)}
            />
            {errors.docNo && <ErrorBox msg={errors.docNo} />}
          </div>
          <div>
            <Label>
              Document Date <span className="text-red-600">*</span>
            </Label>
            <Input
              type="date"
              value={form.docDate}
              onChange={(e) => handleChange('docDate')(e)}
            />
            {errors.docDate && <ErrorBox msg={errors.docDate} />}
          </div>
          <div>
            <Label>Sub Supply Desc</Label>
            <Input
              value={form.subSupplyDesc}
              onChange={(e) => handleChange('subSupplyDesc')(e)}
            />
          </div>
          <div>
            <Label>From GSTIN</Label>
            <Input
              value={form.fromGstin}
              onChange={(e) => handleChange('fromGstin')(e)}
            />
          </div>
          <div>
            <Label>From Pincode</Label>
            <Input
              value={form.fromPincode}
              onChange={(e) => handleChange('fromPincode')(e)}
            />
          </div>
          <div>
            <Label>From State code</Label>
            <Input
              value={form.fromStateCode}
              onChange={(e) => handleChange('fromStateCode')(e)}
            />
          </div>
          <div>
            <Label>From Trd Name</Label>
            <Input
              value={form.fromTrdName}
              onChange={(e) => handleChange('fromTrdName')(e)}
            />
          </div>
          <div>
            <Label>Act from State code</Label>
            <Input
              value={form.actFromStateCode}
              onChange={(e) => handleChange('actFromStateCode')(e)}
            />
          </div>
          <div>
            <Label>To GSTIN</Label>
            <Input
              value={form.toGstin}
              onChange={(e) => handleChange('toGstin')(e)}
            />
          </div>
          <div>
            <Label>To Pincode</Label>
            <Input
              value={form.toPincode}
              onChange={(e) => handleChange('toPincode')(e)}
            />
          </div>
          <div>
            <Label>To State code</Label>
            <Input
              value={form.toStateCode}
              onChange={(e) => handleChange('toStateCode')(e)}
            />
          </div>
          <div>
            <Label>To Trd Name</Label>
            <Input
              value={form.toTrdName}
              onChange={(e) => handleChange('toTrdName')(e)}
            />
          </div>
          <div>
            <Label>Act to State code</Label>
            <Input
              value={form.actToStateCode}
              onChange={(e) => handleChange('actToStateCode')(e)}
            />
          </div>
          <div>
            <Label>Transaction Type</Label>
            <Input
              value={form.transactionType}
              onChange={(e) => handleChange('transactionType')(e)}
            />
          </div>
          <div>
            <Label>From Address 1</Label>
            <Input
              value={form.fromAddr1}
              onChange={(e) => handleChange('fromAddr1')(e)}
            />
          </div>
          <div>
            <Label>From Address 2</Label>
            <Input
              value={form.fromAddr2}
              onChange={(e) => handleChange('fromAddr2')(e)}
            />
          </div>
          <div>
            <Label>From Place</Label>
            <Input
              value={form.fromPlace}
              onChange={(e) => handleChange('fromPlace')(e)}
            />
          </div>
          <div>
            <Label>To Address 1</Label>
            <Input
              value={form.toAddr1}
              onChange={(e) => handleChange('toAddr1')(e)}
            />
          </div>
          <div>
            <Label>To Address 2</Label>
            <Input
              value={form.toAddr2}
              onChange={(e) => handleChange('toAddr2')(e)}
            />
          </div>
          <div>
            <Label>To Place</Label>
            <Input
              value={form.toPlace}
              onChange={(e) => handleChange('toPlace')(e)}
            />
          </div>
          <div>
            <Label>Dispatch From GSTIN</Label>
            <Input
              value={form.dispatchFromGSTIN}
              onChange={(e) => handleChange('dispatchFromGSTIN')(e)}
            />
          </div>
          <div>
            <Label>Dispatch From Trade Name</Label>
            <Input
              value={form.dispatchFromTradeName}
              onChange={(e) => handleChange('dispatchFromTradeName')(e)}
            />
          </div>
          <div>
            <Label>Ship To GSTIN</Label>
            <Input
              value={form.shipToGSTIN}
              onChange={(e) => handleChange('shipToGSTIN')(e)}
            />
          </div>
          <div>
            <Label>Ship To Trade Name</Label>
            <Input
              value={form.shipToTradeName}
              onChange={(e) => handleChange('shipToTradeName')(e)}
            />
          </div>

          {/* Items */}
          <div className="col-span-3 mt-4 w-full rounded-md border p-4">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xl">Items</Label>
              <div className="text-sm text-muted-foreground">
                {form.itemList.length} item(s)
              </div>
            </div>

            <DataTable data={form?.itemList} columns={EWBItemColumns} />

            {errors.itemList && (
              <p className="text-sm text-destructive">{errors.itemList}</p>
            )}
            <div className="mt-6 grid w-full grid-cols-3 gap-4">
              <div>
                <Label>Total Invoice Value</Label>
                <Input
                  value={form.totInvValue}
                  onChange={(e) => handleChange('totInvValue')(e)}
                />
              </div>
              <div>
                <Label>Total Value</Label>
                <Input
                  value={form.totalValue}
                  onChange={(e) => handleChange('totalValue')(e)}
                />
              </div>
              <div>
                <Label>CGST</Label>
                <Input
                  value={form.cgstValue}
                  onChange={(e) => handleChange('cgstValue')(e)}
                />
              </div>
              <div>
                <Label>SGST</Label>
                <Input
                  value={form.sgstValue}
                  onChange={(e) => handleChange('sgstValue')(e)}
                />
              </div>
              <div>
                <Label>IGST</Label>
                <Input
                  value={form.igstValue}
                  onChange={(e) => handleChange('igstValue')(e)}
                />
              </div>
              <div>
                <Label>CESS</Label>
                <Input
                  value={form.cessValue}
                  onChange={(e) => handleChange('cessValue')(e)}
                />
              </div>
              <div>
                <Label>CESS cessNonAdvolValue</Label>
                <Input
                  value={form.cessNonAdvolValue}
                  onChange={(e) => handleChange('cessNonAdvolValue')(e)}
                />
              </div>
            </div>
          </div>

          {/* Transport */}
          <div className="col-span-3 mt-4 w-full rounded-md border p-4">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xl">Transport</Label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Transport Mode</Label>
                <Select onValueChange={(v) => handleChange('transMode')(v)}>
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
                  value={form.transporterId}
                  onChange={(e) => handleChange('transporterId')(e)}
                />
              </div>
              <div>
                <Label>Transport Distance (KM)</Label>
                <Input
                  value={form.transDistance}
                  onChange={(e) => handleChange('transDistance')(e)}
                />
              </div>
              <div>
                <Label>Transport Doc No</Label>
                <Input
                  value={form.transDocNo}
                  onChange={(e) => handleChange('transDocNo')(e)}
                />
                {errors.transDocNo && <ErrorBox msg={errors.transDocNo} />}
              </div>
              <div>
                <Label>Transport Doc Date</Label>
                <Input
                  type="date"
                  value={form.transDocDate}
                  onChange={(e) => handleChange('transDocDate')(e)}
                />
              </div>
              <div>
                <Label>Vehicle Type</Label>
                <Input
                  value={form.vehicleType}
                  onChange={(e) => handleChange('vehicleType')(e)}
                  placeholder="Vehicle Type"
                />
              </div>
              <div>
                <Label>Vehicle No (Part B)</Label>
                <Input
                  value={form.vehicleType}
                  onChange={(e) => handleChange('vehicleNo')(e)}
                  placeholder="(Update in Part B)"
                />
              </div>
            </div>
          </div>

          {/* Remarks + Attach */}
          <div className="col-span-3 mt-4 w-full">
            <Label>Remarks</Label>
            <Textarea
              value={form.remarks}
              onChange={(e) => handleChange('remarks')(e)}
              className="min-h-[80px]"
              placeholder="Enter remarks"
            />
          </div>
        </CardContent>

        <CardFooter className="sticky bottom-0 flex w-full justify-end gap-2 border-t bg-white/70 p-2 backdrop-blur-sm">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreatingEWB(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="blue_outline"
            onClick={() => handleSubmit('save')}
            disabled={submitting}
          >
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={() => handleSubmit('generate')}
            disabled={submitting}
          >
            Generate E-Waybill
          </Button>
        </CardFooter>
      </Card>
    </Wrapper>
  );
}
