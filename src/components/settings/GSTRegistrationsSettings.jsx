'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

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

import { settingsAPI } from '@/api/settings/settingsApi';
import {
  addUpdateAddress,
  addWareHouse,
  getGstSettings,
  updateGst,
} from '@/services/Settings_Services/SettingsService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, MapPin, Plus, Trash2, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import AddNewAddress from '../enterprise/AddNewAddress';
import AddStorageLocationModal from './AddStoragLocations';

const gstCategoryOptions = [
  'Normal / Regular',
  'Composition',
  'SEZ Unit',
  'SEZ Developer',
  'Input Service Distributor (ISD)',
];

export default function GstRegistrations({ enterpriseId }) {
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    code: '',
    address: '',
    addressId: '',
    type: 'Warehouse / Godown',
    is_same_premises: true,
  });
  const [isAddressAdding, setIsAddressAdding] = useState(false);
  const [dataToAddNewPOB, setDataToAddNewPOB] = useState(null);

  // get gst data
  const { data: gstRegistrations } = useQuery({
    queryKey: [settingsAPI.getGstSettings.endpointKey],
    queryFn: () => getGstSettings({ id: enterpriseId }),
    select: (data) => data.data.data,
  });
  const gstList = gstRegistrations?.gsts || [];

  // update gst related metadata
  const updateGstMutation = useMutation({
    mutationFn: updateGst,
    onSuccess: () => {
      toast.success('GST updated Successfully');

      queryClient.invalidateQueries({
        queryKey: [settingsAPI.getGstSettings.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const addWareHouseMutation = useMutation({
    mutationFn: addWareHouse,
    onSuccess: () => {
      toast.success('WareHouse added Successfully');
      // reset
      setNewLocation({
        name: '',
        code: '',
        type: 'Warehouse / Godown',
        is_same_premises: true,
      });

      setIsAddOpen(false);
      queryClient.invalidateQueries({
        queryKey: [settingsAPI.getGstSettings.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const handleAddLocation = () => {
    addWareHouseMutation.mutate({ data: newLocation });
  };

  return (
    <>
      <div className="w-full">
        {/* GSTIN main block */}
        {gstList.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/20 p-10 text-center shadow-none">
            <p className="text-sm font-medium text-muted-foreground">
              No GST registration found
            </p>

            <p className="text-xs text-muted-foreground">
              Add GSTIN to enable tax compliance and storage configuration.
            </p>

            <Button variant="outline" className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Add GSTIN
            </Button>
          </Card>
        ) : (
          gstList.map((gst) => {
            const principalAddress = gst?.addresses?.find(
              (addr) => addr.subType === 'PRINCIPAL_PLACE_OF_BUSINESS',
            );

            const additionalPlacesCount =
              gst?.addresses?.filter(
                (addr) => addr.subType === 'ADDITIONAL_ADDRESS',
              )?.length || 0;

            const additionalPlaces = gst?.addresses?.find(
              (addr) => addr.subType === 'ADDITIONAL_ADDRESS',
            );

            return (
              <Card
                key={gst.id}
                className="rounded-2xl border bg-white p-5 shadow-none"
              >
                {/* Top row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {principalAddress?.pincodeEntity?.state && (
                        <p className="text-base font-semibold">
                          {principalAddress?.pincodeEntity?.state}
                        </p>
                      )}

                      {gst?.isVerified && (
                        <Badge className="rounded-full bg-emerald-50 text-emerald-700">
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">GSTIN</p>
                      <p className="text-lg font-semibold tracking-wide">
                        {gst?.gst || '—'}
                      </p>
                    </div>
                  </div>

                  {/* <Button
                  variant="ghost"
                  className="h-auto justify-start gap-2 rounded-xl px-0 text-red-600 hover:bg-transparent hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove GSTIN
                </Button> */}
                </div>

                {/* GSTID - Public classifiers */}
                <Card className="mt-5 rounded-2xl border bg-muted/20 p-5 shadow-none">
                  <p className="text-sm font-semibold">
                    GSTID – Public classifiers
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {gst?.isVerified && (
                      <>
                        <Badge className="rounded-full bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          GST registered
                        </Badge>

                        <Badge className="rounded-full bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Active
                        </Badge>
                      </>
                    )}
                  </div>

                  <div className="mt-5 max-w-sm space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      GST registration category
                    </Label>

                    <Select
                      value={gst?.registrationType ?? ''}
                      onValueChange={(v) => {
                        updateGstMutation.mutate({
                          id: gst.id,
                          data: {
                            registrationType: v,
                          },
                        });
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-white">
                        <SelectValue placeholder="Select Registration Type" />
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
                      Used for compliance classification and counter-party
                      clarity.
                    </p>
                  </div>
                </Card>

                {/* Principal Place */}
                {principalAddress && (
                  <Card className="mt-6 rounded-2xl border bg-muted/20 p-5 shadow-none">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Principal place of business
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {principalAddress?.address}
                      </p>

                      <Separator />

                      {/* Storage locations (nested block) */}
                      {principalAddress?.warehouses?.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Warehouse className="h-4 w-4 text-muted-foreground" />
                            Storage locations
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Storage locations help you track stock across
                            different areas within the same premises (e.g.,
                            Warehouse vs Production floor). They do not create a
                            new GST location.
                          </p>

                          <Card className="border bg-white p-0 shadow-none">
                            <Table className="rounded-sm">
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[30%]">
                                    Name
                                  </TableHead>
                                  <TableHead className="w-[18%]">
                                    Code
                                  </TableHead>
                                  <TableHead className="w-[32%]">
                                    Type
                                  </TableHead>
                                  <TableHead className="w-[15%]">
                                    Premises
                                  </TableHead>
                                  <TableHead className="w-[5%]" />
                                </TableRow>
                              </TableHeader>

                              <TableBody>
                                {principalAddress?.warehouses?.length ? (
                                  principalAddress?.warehouses?.map((row) => (
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
                                        <Badge className="rounded-full bg-emerald-50 text-emerald-700">
                                          {row.isSamePremises
                                            ? 'Same'
                                            : 'Different'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          disabled
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-600"
                                          onClick={() => {}}
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

                          <button
                            type="button"
                            onClick={() => {
                              setIsAddOpen(true);

                              setNewLocation((prev) => ({
                                ...prev,
                                addressId: principalAddress?.id,
                                address: principalAddress?.address,
                              }));
                            }}
                            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                          >
                            <Plus className="h-4 w-4" />
                            Add storage location
                          </button>

                          <p className="text-xs italic text-muted-foreground">
                            Transfers between storage locations under the same
                            premises are inventory-only and do not create
                            invoices or GST impact.
                          </p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddOpen(true);

                            setNewLocation((prev) => ({
                              ...prev,
                              addressId: principalAddress?.id,
                              address: principalAddress?.address,
                            }));
                          }}
                          className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          <Plus className="h-4 w-4" />
                          Add storage location
                        </button>
                      )}
                    </div>
                  </Card>
                )}

                <Separator className="my-6" />

                {/* Additional places */}
                {additionalPlaces && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value={`additionalPlaces-${gst.id}`}
                      className="border-none"
                    >
                      <AccordionTrigger className="rounded-xl px-2 text-sm font-medium hover:no-underline">
                        Additional places of business ({additionalPlacesCount})
                      </AccordionTrigger>
                      <AccordionContent className="px-2">
                        <Card className="mt-6 rounded-2xl border bg-muted/20 p-5 shadow-none">
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              {additionalPlaces?.address}
                            </p>

                            <Separator />

                            {additionalPlaces?.warehouses?.length > 0 ? (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                                  Storage locations
                                </div>

                                <p className="text-sm text-muted-foreground">
                                  Storage locations help you track stock across
                                  different areas within the same premises
                                  (e.g., Warehouse vs Production floor). They do
                                  not create a new GST location.
                                </p>

                                <Card className="border bg-white p-0 shadow-none">
                                  <Table className="rounded-sm">
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[30%]">
                                          Name
                                        </TableHead>
                                        <TableHead className="w-[18%]">
                                          Code
                                        </TableHead>
                                        <TableHead className="w-[32%]">
                                          Type
                                        </TableHead>
                                        <TableHead className="w-[15%]">
                                          Premises
                                        </TableHead>
                                        <TableHead className="w-[5%]" />
                                      </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                      {additionalPlaces?.warehouses?.length ? (
                                        additionalPlaces?.warehouses?.map(
                                          (row) => (
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
                                                <Badge className="rounded-full bg-emerald-50 text-emerald-700">
                                                  {row.isSamePremises
                                                    ? 'Same'
                                                    : 'Different'}
                                                </Badge>
                                              </TableCell>
                                              <TableCell className="text-right">
                                                <Button
                                                  disabled
                                                  variant="ghost"
                                                  size="icon"
                                                  className="text-red-600"
                                                  onClick={() => {}}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          ),
                                        )
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

                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAddOpen(true);

                                    setNewLocation((prev) => ({
                                      ...prev,
                                      addressId: additionalPlaces?.id,
                                      address: additionalPlaces?.address,
                                    }));
                                  }}
                                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add storage location
                                </button>

                                <p className="text-xs italic text-muted-foreground">
                                  Transfers between storage locations under the
                                  same premises are inventory-only and do not
                                  create invoices or GST impact.
                                </p>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddOpen(true);

                                  setNewLocation((prev) => ({
                                    ...prev,
                                    addressId: additionalPlaces?.id,
                                    address: additionalPlaces?.address,
                                  }));
                                }}
                                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                              >
                                <Plus className="h-4 w-4" />
                                Add storage location
                              </button>
                            )}
                          </div>
                        </Card>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsAddressAdding(true);

                    setDataToAddNewPOB({
                      gstId: gst.id,
                      addressType: 'GST_ADDRESS',
                    });
                  }}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  {principalAddress
                    ? 'Add additional place of business'
                    : 'Add principal place of business'}
                </button>
              </Card>
            );
          })
        )}
      </div>
      <AddStorageLocationModal
        open={isAddOpen}
        setOpen={setIsAddOpen}
        newLocation={newLocation}
        setNewLocation={setNewLocation}
        handleAddLocation={handleAddLocation}
      />
      <AddNewAddress
        isAddressAdding={isAddressAdding}
        setIsAddressAdding={setIsAddressAdding}
        dataToAddNewPOB={dataToAddNewPOB}
        enterpriseId={enterpriseId}
        mutationKey={settingsAPI.addUpdateAddress.endpointKey}
        mutationFn={addUpdateAddress}
        invalidateKey={settingsAPI.getGstSettings.endpointKey}
      />
    </>
  );
}
