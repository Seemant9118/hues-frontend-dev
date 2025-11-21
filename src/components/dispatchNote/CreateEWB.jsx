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
import Overview from '../ui/Overview';
import AttachmentUploader from '../upload/AttachementUploader';
import Wrapper from '../wrappers/Wrapper';
import ErrorBox from '../ui/ErrorBox';

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
  items: [
    { id: 1, name: 'Product A', hsn: '1001', qty: 10, taxableValue: 1000 },
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
    fromTrdName: '',
    fromPincode: '',
    actFromStateCode: '',
    toGstin: '',
    toTrdName: '',
    toPincode: '',
    actToStateCode: '',
    transactionType: '',
    items: [],
    totInvValue: 0,
    totalValue: 0,
    transporterId: '',
    transporterName: '',
    transMode: '',
    transDistance: '',
    transDocNo: '',
    transDocDate: '',
    vehicleNo: '',
    vehicleType: '',
    remarks: '',
  }));

  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
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
      items: inv.items,
      totInvValue: inv.totInvValue,
      totalValue: inv.items.reduce((a, b) => a + (b.taxableValue || 0), 0),
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
    if (!form.items || form.items.length === 0)
      e.items = 'At least one item required';

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
        <CardContent>
          {/* Supply Row */}
          <div className="grid grid-cols-3 gap-4">
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
          </div>

          {/* Doc Row */}
          <div className="mt-4 grid grid-cols-3 gap-4">
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
          </div>

          {/* Addresses */}
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <Label>Source Address</Label>
              <Textarea
                value={`${form.fromTrdName || ''}\nGSTIN: ${form.fromGstin || ''}\nPincode: ${form.fromPincode || ''}`}
                onChange={() => {}}
                className="min-h-[120px]"
              />
            </div>
            <div>
              <Label>Destination Address</Label>
              <Textarea
                value={`${form.toTrdName || ''}\nGSTIN: ${form.toGstin || ''}\nPincode: ${form.toPincode || ''}`}
                onChange={() => {}}
                className="min-h-[120px]"
              />
            </div>
          </div>

          {/* Items */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <div className="text-sm text-muted-foreground">
                {form.items.length} item(s)
              </div>
            </div>
            <div className="mt-2 rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">HSN</th>
                    <th className="p-2 text-left">Qty</th>
                    <th className="p-2 text-left">Taxable</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="p-2">{it.name}</td>
                      <td className="p-2">{it.hsn}</td>
                      <td className="p-2">{it.qty}</td>
                      <td className="p-2">{it.taxableValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors.items && (
              <p className="text-sm text-destructive">{errors.items}</p>
            )}
          </div>

          {/* Transport */}
          <div className="mt-6 rounded-md border p-4">
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
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
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
                <Label>Vehicle No (Part B)</Label>
                <Input
                  value={form.vehicleNo}
                  onChange={(e) => handleChange('vehicleNo')(e)}
                  placeholder="(Update in Part B)"
                />
              </div>
            </div>
          </div>

          {/* Remarks + Attach */}
          <div className="mt-6">
            <Label>Remarks</Label>
            <Textarea
              value={form.remarks}
              onChange={(e) => handleChange('remarks')(e)}
              className="min-h-[80px]"
            />
          </div>
          {/* uploads attachments */}
          <div className="mt-6">
            <AttachmentUploader
              label="Attachments"
              acceptedTypes={['png', 'pdf', 'jpg']}
              files={files}
              setFiles={setFiles}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
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
