'use client';

import { useEffect, useState } from 'react';

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
import { userAuth } from '@/api/user_auth/Users';
import {
  addUpdateAddress,
  addWareHouse,
  getGstSettings,
  updateEnterpriseData,
  updateGst,
} from '@/services/Settings_Services/SettingsService';
import { gstVerify } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, MapPin, Plus, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import AddNewAddress from '../enterprise/AddNewAddress';
import { Checkbox } from '../ui/checkbox';
import AddDocRegistrations from './AddDocRegistrations';
import AddStorageLocationModal from './AddStoragLocations';

export default function GstRegistrations({ enterpriseId, translations }) {
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
  const [markers, setMarkers] = useState({
    isGtaService: false,
    isLegalService: false,
  });
  const [isAddingGst, setIsAddingGst] = useState(false);

  const gstCategoryOptions = [
    translations('tabs.content.tab2.publicClassifiers.categoryOptions.option1'),
    translations('tabs.content.tab2.publicClassifiers.categoryOptions.option2'),
    translations('tabs.content.tab2.publicClassifiers.categoryOptions.option3'),
    translations('tabs.content.tab2.publicClassifiers.categoryOptions.option4'),
    translations('tabs.content.tab2.publicClassifiers.categoryOptions.option5'),
  ];

  // get gst data
  const { data: gstRegistrations } = useQuery({
    queryKey: [settingsAPI.getGstSettings.endpointKey],
    queryFn: () => getGstSettings({ id: enterpriseId }),
    select: (data) => data.data.data,
  });
  const gstList = gstRegistrations?.gsts || [];

  useEffect(() => {
    if (!gstRegistrations) return;

    setMarkers({
      isGtaService: gstRegistrations.isGtaService ?? false,
      isLegalService: gstRegistrations.isLegalService ?? false,
    });
  }, [gstRegistrations]);

  // update gst related metadata
  const updateGstMutation = useMutation({
    mutationFn: updateGst,
    onSuccess: () => {
      toast.success(
        translations('tabs.content.tab2.toasts.gstUpdate.successMsg'),
      );

      queryClient.invalidateQueries({
        queryKey: [settingsAPI.getGstSettings.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          translations('tabs.content.tab2.toasts.gstUpdate.errorMsg'),
      );
    },
  });

  const addWareHouseMutation = useMutation({
    mutationFn: addWareHouse,
    onSuccess: () => {
      toast.success(
        translations('tabs.content.tab2.toasts.warehouseAdd.successMsg'),
      );
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
      toast.error(
        error.response?.data?.message ||
          translations('tabs.content.tab2.toasts.warehouseAdd.errorMsg'),
      );
    },
  });

  const handleAddLocation = () => {
    addWareHouseMutation.mutate({ data: newLocation });
  };

  const updateEnterpriseMutation = useMutation({
    mutationFn: updateEnterpriseData,
    onSuccess: () => {
      toast.success(
        translations('tabs.content.tab2.toasts.enterpriseUpdate.successMsg'),
      );
      queryClient.invalidateQueries({
        queryKey: [settingsAPI.getGstSettings.endpointKey],
        exact: false,
      });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          translations('tabs.content.tab2.toasts.enterpriseUpdate.errorMsg'),
      );
    },
  });

  const handleMarkerChange = (key) => {
    const updatedValue = !markers[key];

    // optimistic UI update
    setMarkers((prev) => ({
      ...prev,
      [key]: updatedValue,
    }));

    // API call
    updateEnterpriseMutation.mutate({
      data: {
        [key]: updatedValue,
      },
    });
  };

  const gstVerifyMutation = useMutation({
    mutationKey: [userAuth.gstVerify.endpointKey],
    mutationFn: gstVerify,
    onSuccess: () => {
      toast.success(
        translations('tabs.content.tab2.toasts.gstVerify.successMsg'),
      );
      setIsAddingGst(false);
      queryClient.invalidateQueries([settingsAPI.getGstSettings.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleGSTVerifyMutation = (form) => {
    gstVerifyMutation.mutate({
      data: {
        gstNumber: form.registrationNumber,
        enterpriseId: form.enterpriseId,
        type: form.type,
      },
    });
  };

  return (
    <>
      <div className="w-full">
        {/* GSTIN main block */}
        {gstList.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/20 p-10 text-center shadow-none">
            <p className="text-sm font-medium text-muted-foreground">
              {translations('tabs.content.tab2.emptyState.title')}
            </p>

            <p className="text-xs text-muted-foreground">
              {translations('tabs.content.tab2.emptyState.subtitle')}
            </p>

            <Button
              onClick={() => setIsAddingGst(true)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {translations('tabs.content.tab2.emptyState.addButton')}
            </Button>
          </Card>
        ) : (
          gstList.map((gst) => {
            const principalAddress = gst?.addresses?.find(
              (addr) => addr.subType === 'PRINCIPAL_PLACE_OF_BUSINESS',
            );

            const additionalPlaces =
              gst?.addresses?.filter(
                (addr) => addr.subType === 'ADDITIONAL_ADDRESS',
              ) || [];

            const additionalPlacesCount = additionalPlaces.length;

            return (
              <>
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
                            {translations('tabs.content.tab2.badges.verified')}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {translations('tabs.content.tab2.gstCard.gstinLabel')}
                        </p>
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
                      {translations(
                        'tabs.content.tab2.publicClassifiers.title',
                      )}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {gst?.isVerified && (
                        <>
                          <Badge className="rounded-full bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            {translations(
                              'tabs.content.tab2.badges.gstRegistered',
                            )}
                          </Badge>

                          <Badge className="rounded-full bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            {translations('tabs.content.tab2.badges.active')}
                          </Badge>
                        </>
                      )}
                    </div>

                    <div className="mt-5 max-w-sm space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        {translations(
                          'tabs.content.tab2.publicClassifiers.registrationCategory',
                        )}
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
                          <SelectValue
                            placeholder={translations(
                              'tabs.content.tab2.publicClassifiers.selectPlaceholder',
                            )}
                          />
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
                        {translations(
                          'tabs.content.tab2.publicClassifiers.subtitle',
                        )}
                      </p>
                    </div>
                  </Card>

                  {/* Principal Place */}
                  {principalAddress && (
                    <Card className="mt-6 rounded-2xl border bg-muted/20 p-5 shadow-none">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {translations(
                            'tabs.content.tab2.addresses.principal.title',
                          )}
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
                              {translations(
                                'tabs.content.tab2.storageLocations.title',
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {translations(
                                'tabs.content.tab2.storageLocations.subtitle',
                              )}
                            </p>

                            <Card className="border bg-white p-0 shadow-none">
                              <Table className="rounded-sm">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[30%]">
                                      {translations(
                                        'tabs.content.tab2.storageLocations.tableHeaders.name',
                                      )}
                                    </TableHead>
                                    <TableHead className="w-[18%]">
                                      {translations(
                                        'tabs.content.tab2.storageLocations.tableHeaders.code',
                                      )}
                                    </TableHead>
                                    <TableHead className="w-[32%]">
                                      {translations(
                                        'tabs.content.tab2.storageLocations.tableHeaders.type',
                                      )}
                                    </TableHead>
                                    <TableHead className="w-[15%]">
                                      {translations(
                                        'tabs.content.tab2.storageLocations.tableHeaders.premises',
                                      )}
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
                                              ? translations(
                                                  'tabs.content.tab2.badges.same',
                                                )
                                              : translations(
                                                  'tabs.content.tab2.badges.different',
                                                )}
                                          </Badge>
                                        </TableCell>
                                        {/* <TableCell className="text-right">
                                          <Button
                                            disabled
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-600"
                                            onClick={() => { }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TableCell> */}
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-sm text-muted-foreground"
                                      >
                                        {translations(
                                          'tabs.content.tab2.storageLocations.emptyState',
                                        )}
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
                              {translations(
                                'tabs.content.tab2.storageLocations.addButton',
                              )}
                            </button>

                            <p className="text-xs italic text-muted-foreground">
                              {translations(
                                'tabs.content.tab2.storageLocations.transferNote',
                              )}
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
                            {translations(
                              'tabs.content.tab2.storageLocations.addButton',
                            )}
                          </button>
                        )}
                      </div>
                    </Card>
                  )}

                  <Separator className="my-6" />

                  {/* Additional places */}
                  {additionalPlaces.length > 0 && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem
                        value={`additionalPlaces-${gst.id}`}
                        className="border-none"
                      >
                        <AccordionTrigger className="rounded-xl px-2 text-sm font-medium hover:no-underline">
                          {translations(
                            'tabs.content.tab2.addresses.additional.titleWithCount',
                          )}{' '}
                          ({additionalPlacesCount})
                        </AccordionTrigger>

                        <AccordionContent className="px-2">
                          <div className="space-y-6">
                            {additionalPlaces.map((place) => (
                              <Card
                                key={place.id}
                                className="rounded-2xl border bg-muted/20 p-5 shadow-none"
                              >
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-sm font-medium">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {translations(
                                      'tabs.content.tab2.addresses.additional.title',
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {place.address}
                                  </p>

                                  <Separator />

                                  {/* Storage locations */}
                                  {place?.warehouses?.length > 0 ? (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2 text-sm font-medium">
                                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                                        {translations(
                                          'tabs.content.tab2.storageLocations.title',
                                        )}
                                      </div>

                                      <Card className="border bg-white p-0 shadow-none">
                                        <Table className="rounded-sm">
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>
                                                {translations(
                                                  'tabs.content.tab2.storageLocations.tableHeaders.name',
                                                )}
                                              </TableHead>
                                              <TableHead>
                                                {translations(
                                                  'tabs.content.tab2.storageLocations.tableHeaders.code',
                                                )}
                                              </TableHead>
                                              <TableHead>
                                                {translations(
                                                  'tabs.content.tab2.storageLocations.tableHeaders.type',
                                                )}
                                              </TableHead>
                                              <TableHead>
                                                {translations(
                                                  'tabs.content.tab2.storageLocations.tableHeaders.premises',
                                                )}
                                              </TableHead>
                                              <TableHead />
                                            </TableRow>
                                          </TableHeader>

                                          <TableBody>
                                            {place.warehouses.map((row) => (
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
                                                      ? translations(
                                                          'tabs.content.tab2.badges.same',
                                                        )
                                                      : translations(
                                                          'tabs.content.tab2.badges.different',
                                                        )}
                                                  </Badge>
                                                </TableCell>
                                                {/* <TableCell className="text-right">
                                                  <Button
                                                    disabled
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </TableCell> */}
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </Card>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setIsAddOpen(true);
                                          setNewLocation((prev) => ({
                                            ...prev,
                                            addressId: place.id,
                                            address: place.address,
                                          }));
                                        }}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                      >
                                        <Plus className="h-4 w-4" />
                                        {translations(
                                          'tabs.content.tab2.storageLocations.addButton',
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsAddOpen(true);
                                        setNewLocation((prev) => ({
                                          ...prev,
                                          addressId: place.id,
                                          address: place.address,
                                        }));
                                      }}
                                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                    >
                                      <Plus className="h-4 w-4" />
                                      {translations(
                                        'tabs.content.tab2.storageLocations.addButton',
                                      )}
                                    </button>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
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
                      ? translations(
                          'tabs.content.tab2.addresses.additional.addButton',
                        )
                      : translations(
                          'tabs.content.tab2.addresses.principal.addButton',
                        )}
                  </button>
                </Card>
              </>
            );
          })
        )}
        {/* RCM supplier markers Markers */}
        <Card className="mt-2 flex flex-col gap-2 rounded-2xl border bg-white p-6">
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm font-semibold tracking-wide text-primary">
              {translations('tabs.content.tab2.rcmMarkers.title')}
            </p>
            <p className="text-xs text-muted-foreground">
              {translations('tabs.content.tab2.rcmMarkers.subtitle')}
            </p>
          </div>
          {/* GTA */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="isGtaService"
              checked={markers.isGtaService}
              onCheckedChange={() => handleMarkerChange('isGtaService')}
            />
            <Label
              htmlFor="isGtaService"
              className="cursor-pointer text-sm leading-snug"
            >
              {translations('tabs.content.tab2.rcmMarkers.gtaService')}
            </Label>
          </div>

          {/* Legal Services */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="isLegalService"
              checked={markers.isLegalService}
              onCheckedChange={() => handleMarkerChange('isLegalService')}
            />
            <Label
              htmlFor="isLegalService"
              className="cursor-pointer text-sm leading-snug"
            >
              {translations('tabs.content.tab2.rcmMarkers.legalService')}
            </Label>
          </div>
        </Card>
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

      <AddDocRegistrations
        open={isAddingGst}
        onClose={setIsAddingGst}
        enterpriseId={enterpriseId}
        type={gstRegistrations?.type}
        onSubmit={handleGSTVerifyMutation}
      />
    </>
  );
}
