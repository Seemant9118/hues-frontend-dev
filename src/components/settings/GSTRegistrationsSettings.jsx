'use client';

import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { CheckCircle2, MapPin, Plus, Trash2, Warehouse } from 'lucide-react';

const storageTypeOptions = [
  'Warehouse / Godown',
  'Production / Manufacturing',
  'Retail Store',
  'Office',
  'Dispatch Hub',
];

const gstCategoryOptions = [
  'Normal / Regular',
  'Composition',
  'SEZ Unit',
  'SEZ Developer',
  'Input Service Distributor (ISD)',
];

const initialGstin = {
  state: 'Maharashtra',
  status: 'Verified',
  gstin: '27AAFCR7299K2ZC',

  gstRegistered: true,
  isActive: true,
  gstCategory: 'Normal / Regular',

  principalPlace:
    'Shop No. 5, Laxmi Industrial Estate, Andheri East, Mumbai - 400069, Maharashtra',

  storageLocations: [
    {
      id: '1',
      name: 'Raw Material Store',
      code: 'WH-01',
      type: 'Warehouse / Godown',
      premises: 'Same',
    },
    {
      id: '2',
      name: 'Production Floor',
      code: 'PR-01',
      type: 'Production / Manufacturing',
      premises: 'Same',
    },
  ],

  additionalPlacesCount: 2,
};

export default function GstRegistrations() {
  const [gstData, setGstData] = useState(initialGstin);

  // Add Storage Location dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    code: '',
    type: 'Warehouse / Godown',
    samePremises: true,
  });

  const canAddLocation = useMemo(() => {
    return newLocation.name.trim().length > 0 && newLocation.type;
  }, [newLocation]);

  const handleRemoveGstin = () => {
    // You can wire API here.
    // For demo we just reset values.
    setGstData((prev) => ({
      ...prev,
      gstin: '',
      storageLocations: [],
    }));
  };

  const handleDeleteStorageRow = (id) => {
    setGstData((prev) => ({
      ...prev,
      storageLocations: prev.storageLocations.filter((x) => x.id !== id),
    }));
  };

  const handleAddLocation = () => {
    if (!canAddLocation) return;

    const newRow = {
      id: crypto?.randomUUID?.() || String(Date.now()),
      name: newLocation.name.trim(),
      code: newLocation.code.trim() || '-',
      type: newLocation.type,
      premises: newLocation.samePremises ? 'Same' : 'Different',
    };

    setGstData((prev) => ({
      ...prev,
      storageLocations: [...prev.storageLocations, newRow],
    }));

    // reset
    setNewLocation({
      name: '',
      code: '',
      type: 'Warehouse / Godown',
      samePremises: true,
    });

    setIsAddOpen(false);
  };

  return (
    <div className="w-full">
      <Card className="rounded-2xl border bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold tracking-wide text-blue-600">
            GST REGISTRATIONS
          </p>

          <Button variant="outline" className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add GSTIN
          </Button>
        </div>

        <Separator className="my-5" />

        {/* GSTIN main block */}
        <Card className="rounded-2xl border bg-white p-5 shadow-none">
          {/* Top row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <p className="text-base font-semibold">{gstData.state}</p>

                <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  {gstData.status}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">GSTIN</p>
                <p className="text-lg font-semibold tracking-wide">
                  {gstData.gstin || '—'}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              className="h-auto justify-start gap-2 rounded-xl px-0 text-red-600 hover:bg-transparent hover:text-red-600"
              onClick={handleRemoveGstin}
            >
              <Trash2 className="h-4 w-4" />
              Remove GSTIN
            </Button>
          </div>

          {/* GSTID - Public classifiers */}
          <Card className="mt-5 rounded-2xl border bg-muted/20 p-5 shadow-none">
            <p className="text-sm font-semibold">GSTID – Public classifiers</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                GST registered
              </Badge>

              <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Active
              </Badge>
            </div>

            <div className="mt-5 max-w-sm space-y-2">
              <Label className="text-sm text-muted-foreground">
                GST registration category
              </Label>

              <Select
                value={gstData.gstCategory}
                onValueChange={(v) =>
                  setGstData((prev) => ({ ...prev, gstCategory: v }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl bg-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {gstCategoryOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground">
                Used for compliance classification and counter-party clarity.
              </p>
            </div>
          </Card>

          {/* Principal Place */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Principal place of business
            </div>

            <p className="text-sm text-muted-foreground">
              {gstData.principalPlace}
            </p>
          </div>

          <Separator className="my-6" />

          {/* Storage locations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Warehouse className="h-4 w-4 text-muted-foreground" />
              Storage locations
            </div>

            <p className="text-sm text-muted-foreground">
              Storage locations help you track stock across different areas
              within the same premises (e.g., Warehouse vs Production floor).
              They do not create a new GST location.
            </p>

            <Card className="rounded-2xl border bg-white p-0 shadow-none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Name</TableHead>
                    <TableHead className="w-[18%]">Code</TableHead>
                    <TableHead className="w-[32%]">Type</TableHead>
                    <TableHead className="w-[15%]">Premises</TableHead>
                    <TableHead className="w-[5%]" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {gstData.storageLocations.length ? (
                    gstData.storageLocations.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.code}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.type}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-emerald-50 text-emerald-700"
                          >
                            {row.premises}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-600"
                            onClick={() => handleDeleteStorageRow(row.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        No storage locations added.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>

            {/* Add Storage Location */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Add storage location
                </button>
              </DialogTrigger>

              <DialogContent className="max-w-lg rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Add storage location
                  </DialogTitle>
                  <DialogDescription>
                    Storage locations help you track stock across different
                    areas within the same premises (e.g., Warehouse vs
                    Production floor). They do not create a new GST location.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label>
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={newLocation.name}
                      onChange={(e) =>
                        setNewLocation((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="e.g., Raw Material Store, Production Floor"
                      className="h-11 rounded-xl"
                    />
                  </div>

                  {/* Internal code */}
                  <div className="space-y-2">
                    <Label>Internal code (optional)</Label>
                    <Input
                      value={newLocation.code}
                      onChange={(e) =>
                        setNewLocation((p) => ({ ...p, code: e.target.value }))
                      }
                      placeholder="e.g., WH-01, PR-01"
                      className="h-11 rounded-xl"
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <Label>
                      Type <span className="text-red-500">*</span>
                    </Label>

                    <Select
                      value={newLocation.type}
                      onValueChange={(v) =>
                        setNewLocation((p) => ({ ...p, type: v }))
                      }
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {storageTypeOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Same premises */}
                  <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Same premises as this address?
                      </p>
                    </div>

                    <Switch
                      checked={newLocation.samePremises}
                      onCheckedChange={(v) =>
                        setNewLocation((p) => ({ ...p, samePremises: v }))
                      }
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-3">
                  <DialogClose asChild>
                    <Button variant="outline" className="rounded-xl">
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button
                    className="rounded-xl"
                    onClick={handleAddLocation}
                    disabled={!canAddLocation}
                  >
                    Add location
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <p className="text-xs italic text-muted-foreground">
              Transfers between storage locations under the same premises are
              inventory-only and do not create invoices or GST impact.
            </p>
          </div>

          <Separator className="my-6" />

          {/* Additional places */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="additionalPlaces" className="border-none">
              <AccordionTrigger className="rounded-xl px-2 text-sm font-medium hover:no-underline">
                Additional places of business ({gstData.additionalPlacesCount})
              </AccordionTrigger>
              <AccordionContent className="px-2">
                <div className="space-y-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                  >
                    <Plus className="h-4 w-4" />
                    Add additional place of business
                  </button>

                  <p className="text-sm text-muted-foreground">
                    You can add more business addresses here (optional).
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </Card>
    </div>
  );
}
