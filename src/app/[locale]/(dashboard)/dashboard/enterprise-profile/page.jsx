'use client';

import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { settingsAPI } from '@/api/settings/settingsApi';
import { templateApi } from '@/api/templates_api/template_api';
import { userAuth } from '@/api/user_auth/Users';
import { validateEmail } from '@/appUtils/ValidationUtils';
import { capitalize, getEnterpriseId } from '@/appUtils/helperFunctions';
import AddNewAddress from '@/components/enterprise/AddNewAddress';
import Avatar from '@/components/ui/Avatar';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import {
  updateEnterpriseFields,
  updateEnterpriseIdentificationDetails,
} from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { addUpdateAddress } from '@/services/Settings_Services/SettingsService';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  Mail,
  MapPin,
  Pencil,
  PencilIcon,
  Phone,
  PlusCircle,
  QrCode,
  Settings,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

function EnterpriseProfile() {
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = getEnterpriseId();
  useMetaData(`Enterprise Profile`, 'HUES ENTEPRRISE PROFILE');

  const translations = useTranslations('enterpriseProfile');
  const queryClient = useQueryClient();
  const router = useRouter();

  const { hasPermission } = usePermission();
  const [tab, setTab] = useState('enterpriseOverview');

  const [isEditing, setIsEditing] = useState({
    gst: false,
    udyam: false,
    mobile: false,
    email: false,
  });

  const [updateEnterpriseDetails, setUpdateEnterpriseDetails] = useState({
    identifierType: '',
    identifierNum: '',
  });

  const [enterpriseDataUpdate, setEnterpriseDataUpdate] = useState(null);

  const [isAddressAdding, setIsAddressAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressId, setAddressId] = useState(null);

  const onTabChange = (value) => setTab(value);

  // update enterprise mutation
  const updateEnterpriseMutation = useMutation({
    mutationKey: [
      enterpriseUser.updateEnterpriseIdentificationDetails.endpointKey,
      enterpriseId,
    ],
    mutationFn: () =>
      updateEnterpriseIdentificationDetails(
        enterpriseId,
        updateEnterpriseDetails?.identifierType,
        updateEnterpriseDetails?.identifierNum,
      ),
    onSuccess: () => {
      toast.success(translations('toasts.update.successMsg'));
      setUpdateEnterpriseDetails({ identifierType: '', identifierNum: '' });
      setIsEditing({ gst: false, udyam: false, mobile: false, email: false });
      queryClient.invalidateQueries([userAuth.getProfileDetails.endpointKey]);
    },
    onError: () => {
      toast.error(
        translations('toasts.update.errorMsg', {
          type: updateEnterpriseDetails?.identifierType,
        }),
      );
    },
  });

  // update enterprise fields mutation
  const updateEnterpriseFieldsMutation = useMutation({
    mutationKey: [enterpriseUser.updateEnterpriseFields.endpointKey],
    mutationFn: updateEnterpriseFields,
    onSuccess: () => {
      toast.success(translations('toasts.update.successMsg'));
      setEnterpriseDataUpdate(null);
      setIsEditing({ gst: false, udyam: false, mobile: false, email: false });
      queryClient.invalidateQueries([userAuth.getProfileDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(
        translations(error.response.data.message || 'toasts.update.errorMsg'),
      );
    },
  });

  // fetch profileDetails API
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled:
      tab === 'enterpriseOverview' &&
      hasPermission('permission:view-dashboard'),
  });

  const enterprise = profileDetails?.enterpriseDetails;

  const pvtUrl = enterprise?.logoUrl;

  // Fetch the public logo url
  const { data: publicUrl } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, pvtUrl],
    queryFn: () => getDocument(pvtUrl),
    enabled: !!pvtUrl,
    select: (res) => res.data.data,
  });

  const isAnyEditing =
    isEditing.gst || isEditing.udyam || isEditing.mobile || isEditing.email;

  // Fake derived UI values (you can connect to backend later)
  const profileCompleteness = enterprise?.id ? 70 : 10;
  const completenessLabel = profileCompleteness > 60 ? 'Strong' : 'Weak';

  const complianceItems = [
    {
      label: 'GST',
      status: enterprise?.gstNumber ? 'Registered' : 'Not Added',
      active: true,
    },
    {
      label: 'Income Tax (PAN)',
      status: enterprise?.panNumber ? 'Verified' : 'Not Added',
      active: true,
    },
    {
      label: 'Corporate Identity (CIN)',
      status: enterprise?.cinNumber ? 'Verified' : 'Not Added',
      active: true,
    },
    {
      label: 'MSME (UDYAM)',
      status: enterprise?.udyam ? 'Verified' : 'Not Added',
      active: true,
    },
  ];

  const links = [
    {
      label: 'Website',
      value: enterprise?.websiteUrl || 'https://yourdomain.com',
      icon: Globe,
    },
    {
      label: 'LinkedIn',
      value:
        enterprise?.linkedinUrl || 'https://linkedin.com/company/your-company',
      icon: Link2,
    },
  ];

  return (
    <ProtectedWrapper permissionCode="permission:view-dashboard">
      <Wrapper className="h-full">
        <SubHeader name={'Enterprise profile'}>
          <div className="flex items-center gap-2">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/enterprise-profile/settings`)
              }
            >
              <Settings size={14} /> Settings
            </Button> */}
          </div>
        </SubHeader>

        <Tabs
          className="flex flex-col"
          value={tab}
          onValueChange={onTabChange}
          defaultValue={'enterpriseOverview'}
        >
          <TabsList className="w-fit border">
            <TabsTrigger value="enterpriseOverview">
              {translations('tabs.label.tab1')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enterpriseOverview">
            {/* If enterprise not completed */}
            {!enterprise?.id && (
              <div className="relative mt-4">
                <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-sm bg-[#dedede88]"></div>
                <div className="grid grid-cols-3 grid-rows-2 gap-8 rounded-sm border bg-white p-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.pan')}
                    </Label>
                    <span className="text-lg font-bold">{'XXXXXX1234'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.name')}
                    </Label>
                    <span className="text-lg font-bold">
                      {'Your Enterprise Name'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.type')}
                    </Label>
                    <span className="text-lg font-bold">{'pvt. ltd.'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.mobile')}
                    </Label>
                    <span className="text-lg font-bold">
                      +91 {'9876543210'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.email')}
                    </Label>
                    <span className="text-lg font-bold">
                      {'yourenterprise@gmail.com'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.gst')}
                    </Label>
                    <span className="text-lg font-bold">{'XXXXXXXXXXXX'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.udyam')}
                    </Label>
                    <span className="text-lg font-bold">{'XXXXXXXXXXXX'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* If enterprise exists */}
            {enterprise?.id && (
              <div className="flex flex-col gap-4">
                {/* ✅  TOP ENTERPRISE HEADER CARD */}
                <Card className="rounded-2xl border p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* left: logo + title */}
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full border bg-muted">
                        {enterprise?.logoUrl ? (
                          <Image
                            src={publicUrl?.publicUrl}
                            alt="logo"
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Avatar name={enterprise?.name} />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-black">
                            {enterprise?.name || '-'}
                          </h2>

                          <Badge variant="secondary" className="rounded-full">
                            {capitalize(enterprise?.type) || 'Body Corporate'}
                          </Badge>

                          <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                            Verified
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">
                            CIN:{' '}
                            <span className="font-semibold text-black">
                              {enterprise?.cinNumber || '-'}
                            </span>
                          </span>

                          <span className="hidden md:inline">•</span>

                          <span>
                            {capitalize(enterprise?.type) || 'Private Limited'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* right: actions + completeness */}
                    <div className="flex flex-col gap-3 md:items-end">
                      <div className="flex items-center gap-2">
                        <Button disabled variant="outline" size="sm">
                          <ExternalLink size={14} />
                          Catalogue
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/enterprise-profile/settings`,
                            )
                          }
                        >
                          <Settings size={14} />
                          Settings
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground">
                            Profile completeness
                          </span>

                          <div className="flex items-center gap-3">
                            <Progress
                              value={profileCompleteness}
                              className="h-2 w-28"
                            />
                            <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                              {completenessLabel}
                            </Badge>
                          </div>

                          <span className="text-xs text-muted-foreground">
                            Last updated • 28 Jan 2026
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <Separator className="my-4" /> */}

                  {/* TODO: (move to enterprise settings )Upload Logo button (kept from your old UI) */}
                  {/* <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {translations(
                          'tabs.content.tab1.profilePicSection.title',
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {translations(
                          'tabs.content.tab1.profilePicSection.format',
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id="logoUpload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={(e) => uploadFile(e.target.files?.[0])}
                        className="hidden"
                      />

                      <Button
                        debounceTime={1000}
                        size="sm"
                        variant="blue_outline"
                        type="button"
                        onClick={openFilePicker}
                      >
                        <span className="flex items-center gap-2">
                          <Upload size={16} />
                          {enterprise?.logoUrl
                            ? translations(
                                'tabs.content.tab1.profilePicSection.ctas.update',
                              )
                            : translations(
                                'tabs.content.tab1.profilePicSection.ctas.upload',
                              )}
                        </span>
                      </Button>
                    </div>
                  </div> */}
                </Card>

                {/* ✅ MAIN GRID LIKE SCREENSHOT */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {/* LEFT SIDE (2/3) */}
                  <div className="flex flex-col gap-4 lg:col-span-2">
                    {/* ABOUT THE ENTERPRISE */}
                    <Card className="rounded-2xl border p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        About the enterprise
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed">
                        {enterprise?.description ||
                          `${enterprise?.name || 'This enterprise'} is a leading provider of enterprise IT solutions, telecom infrastructure, and electrical equipment across Maharashtra and Gujarat.`}
                      </p>
                    </Card>

                    {/* COMPLIANCE SNAPSHOT */}
                    <Card className="rounded-2xl border p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Compliance snapshot
                      </h3>

                      <div className="mt-4 flex flex-col gap-4">
                        {complianceItems.map((item) => (
                          <>
                            <div
                              key={item.label}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">{item.label}</span>
                              <div className="flex items-center gap-2">
                                <Badge className="gap-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                  <CheckCircle2 size={14} />
                                  {item.status}
                                </Badge>
                                <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                  Active
                                </Badge>
                              </div>
                            </div>
                            <Separator />
                          </>
                        ))}
                      </div>
                    </Card>

                    {/* TAX BEHAVIOUR MARKERS */}
                    <Card className="rounded-2xl border p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Tax behaviour markers
                      </h3>

                      <div className="mt-4">
                        <Badge
                          variant="outline"
                          className="rounded-full border border-primary px-4 py-2 text-sm text-primary"
                        >
                          Provides GTA services
                        </Badge>
                        <p className="mt-2 text-xs italic text-muted-foreground">
                          Self-declared by the enterprise. Used for GST
                          decisioning.
                        </p>
                      </div>
                    </Card>

                    {/* COMMERCIAL OVERVIEW */}
                    <Card className="rounded-2xl border p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Commercial overview
                      </h3>

                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm font-bold text-muted-foreground">
                          Annual Turnover:
                        </span>
                        <span className="text-sm font-semibold text-black">
                          ₹40 lakh – ₹1.5 crore
                        </span>
                      </div>
                    </Card>

                    {/* GST REGISTRATIONS */}
                    <Card className="rounded-2xl border p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        GST registrations
                      </h3>

                      <p className="mt-2 text-xs text-muted-foreground">
                        GST registrations are displayed state-wise.
                      </p>

                      <div className="mt-4 flex flex-col gap-4">
                        {/* You can map these from your backend later */}
                        <Card className="rounded-2xl border bg-gray-50 p-5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-semibold">
                              Maharashtra
                            </h4>
                            <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                              Active
                            </Badge>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-muted-foreground">
                                GSTIN
                              </span>
                              <span className="text-lg font-semibold">
                                {enterprise?.gstNumber || '27AAFCR7299K2ZC'}
                              </span>
                            </div>

                            <div className="flex flex-col gap-2">
                              <span className="px-2 text-xs text-muted-foreground">
                                GST status
                              </span>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                  GST registered
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="rounded-full"
                                >
                                  Normal / Regular
                                </Badge>
                                <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                  Active
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin size={14} />
                            <p>Principal place of business</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <p>
                              Shop No. 5, Laxmi Industrial Estate, Andheri East,
                              Mumbai - 400069, Maharashtra
                            </p>
                          </div>
                        </Card>
                      </div>
                    </Card>

                    {/* BUSINESS AREAS */}
                    <Card className="rounded-2xl border p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Business areas
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Based on recent GST filings and declared business
                        activity.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {[
                          'Computers & IT equipment',
                          'Telecom devices',
                          'Electrical transformers',
                          'Office furniture',
                          'Wires & cables',
                        ].map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="rounded-full px-4 py-2"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </Card>

                    {/* ✅ KEEP YOUR EDITABLE FIELDS SECTION (EMAIL/MOBILE/GST/UDYAM + ADDRESS) */}
                    <Card className="rounded-2xl border p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Enterprise information
                      </h3>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Mobile */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">
                              {translations('tabs.content.tab1.label.mobile')}
                            </Label>
                            {isEditing.mobile ? (
                              <X
                                className="cursor-pointer"
                                size={14}
                                onClick={() => {
                                  setIsEditing((prev) => ({
                                    ...prev,
                                    mobile: false,
                                  }));
                                  setEnterpriseDataUpdate(null);
                                }}
                              />
                            ) : (
                              <Pencil
                                className="cursor-pointer"
                                size={12}
                                onClick={() => {
                                  setIsEditing((prev) => ({
                                    ...prev,
                                    mobile: true,
                                  }));
                                  setEnterpriseDataUpdate(() => ({
                                    mobileNumber: enterprise?.mobileNumber,
                                  }));
                                }}
                              />
                            )}
                          </div>

                          {isEditing.mobile ? (
                            <Input
                              type="number"
                              placeholder="+91 XXXXXXXXXX"
                              value={enterpriseDataUpdate?.mobileNumber || ''}
                              onChange={(e) =>
                                setEnterpriseDataUpdate((prev) => ({
                                  ...prev,
                                  mobileNumber: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <span className="text-sm font-semibold">
                              +91 {enterprise?.mobileNumber || '-'}
                            </span>
                          )}
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">
                              {translations('tabs.content.tab1.label.email')}
                            </Label>
                            {isEditing.email ? (
                              <X
                                className="cursor-pointer"
                                size={14}
                                onClick={() => {
                                  setIsEditing((prev) => ({
                                    ...prev,
                                    email: false,
                                  }));
                                  setEnterpriseDataUpdate(null);
                                }}
                              />
                            ) : (
                              <Pencil
                                className="cursor-pointer"
                                size={12}
                                onClick={() => {
                                  setIsEditing((prev) => ({
                                    ...prev,
                                    email: true,
                                  }));
                                  setEnterpriseDataUpdate(() => ({
                                    email: enterprise?.email,
                                  }));
                                }}
                              />
                            )}
                          </div>

                          {isEditing.email ? (
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              value={enterpriseDataUpdate?.email || ''}
                              onChange={(e) =>
                                setEnterpriseDataUpdate((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <span className="text-sm font-semibold">
                              {enterprise?.email || '-'}
                            </span>
                          )}
                        </div>

                        {/* PAN */}
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs">
                            {translations('tabs.content.tab1.label.pan')}
                          </Label>
                          <span className="text-sm font-semibold">
                            {enterprise?.panNumber || '-'}
                          </span>
                        </div>

                        {/* GST */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">
                              {translations('tabs.content.tab1.label.gst')}
                            </Label>

                            {!enterprise?.gstNumber && !isEditing.udyam ? (
                              isEditing.gst ? (
                                <X
                                  className="cursor-pointer"
                                  size={14}
                                  onClick={() => {
                                    setIsEditing((prev) => ({
                                      ...prev,
                                      gst: false,
                                    }));
                                    setUpdateEnterpriseDetails({
                                      identifierType: '',
                                      identifierNum: '',
                                    });
                                  }}
                                />
                              ) : (
                                <Pencil
                                  size={12}
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setIsEditing((prev) => ({
                                      ...prev,
                                      gst: true,
                                    }))
                                  }
                                />
                              )
                            ) : null}
                          </div>

                          {isEditing.gst ? (
                            <Input
                              type="text"
                              placeholder={translations(
                                'tabs.content.tab1.input.gst.placeholder',
                              )}
                              value={
                                updateEnterpriseDetails?.identifierNum || ''
                              }
                              onChange={(e) => {
                                setUpdateEnterpriseDetails((prev) => ({
                                  ...prev,
                                  identifierType: 'gst',
                                  identifierNum: e.target.value,
                                }));
                              }}
                            />
                          ) : (
                            <span className="text-sm font-semibold">
                              {enterprise?.gstNumber || '-'}
                            </span>
                          )}
                        </div>

                        {/* UDYAM */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">
                              {translations('tabs.content.tab1.label.udyam')}
                            </Label>

                            {!enterprise?.udyam && !isEditing.gst ? (
                              isEditing.udyam ? (
                                <X
                                  className="cursor-pointer"
                                  size={14}
                                  onClick={() => {
                                    setIsEditing((prev) => ({
                                      ...prev,
                                      udyam: false,
                                    }));
                                    setUpdateEnterpriseDetails({
                                      identifierType: '',
                                      identifierNum: '',
                                    });
                                  }}
                                />
                              ) : (
                                <Pencil
                                  size={12}
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setIsEditing((prev) => ({
                                      ...prev,
                                      udyam: true,
                                    }))
                                  }
                                />
                              )
                            ) : null}
                          </div>

                          {isEditing.udyam ? (
                            <Input
                              type="text"
                              placeholder={translations(
                                'tabs.content.tab1.input.udyam.placeholder',
                              )}
                              value={
                                updateEnterpriseDetails?.identifierNum || ''
                              }
                              onChange={(e) => {
                                setUpdateEnterpriseDetails((prev) => ({
                                  ...prev,
                                  identifierType: 'udyam',
                                  identifierNum: e.target.value,
                                }));
                              }}
                            />
                          ) : (
                            <span className="text-sm font-semibold">
                              {enterprise?.udyam || '-'}
                            </span>
                          )}
                        </div>

                        {/* Address List */}
                        <div className="flex flex-col gap-2 lg:col-span-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">
                              {translations('tabs.content.tab1.label.address')}
                            </Label>

                            <button
                              onClick={() => setIsAddressAdding(true)}
                              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              <PlusCircle size={12} /> add
                            </button>
                          </div>

                          <AddNewAddress
                            isAddressAdding={isAddressAdding}
                            setIsAddressAdding={setIsAddressAdding}
                            mutationKey={
                              settingsAPI.addUpdateAddress.endpointKey
                            }
                            mutationFn={addUpdateAddress}
                            invalidateKey={
                              userAuth.getProfileDetails.endpointKey
                            }
                            editingAddress={editingAddress}
                            setEditingAddress={setEditingAddress}
                            editingAddressId={addressId}
                            setEditingAddressId={setAddressId}
                          />

                          <div className="scrollBarStyles flex max-h-[140px] flex-col gap-2 overflow-auto">
                            {enterprise?.addressList?.length > 0 ? (
                              enterprise?.addressList.map((addr) => (
                                <div
                                  key={addr.id}
                                  className="flex w-full items-center justify-between gap-2 rounded-2xl border bg-white px-3 py-2 pr-5"
                                >
                                  <div className="flex w-full items-center gap-2">
                                    <MapPin
                                      size={14}
                                      className="shrink-0 text-primary"
                                    />
                                    <p
                                      className="truncate text-sm font-medium"
                                      title={addr.address}
                                    >
                                      {addr.address || '-'}
                                    </p>
                                  </div>

                                  <button
                                    onClick={() => {
                                      setIsAddressAdding(true);
                                      setEditingAddress(addr);
                                      setAddressId(addr.id);
                                    }}
                                    className="text-primary"
                                  >
                                    <PencilIcon size={14} />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm font-medium text-muted-foreground">
                                -
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Save / Cancel */}
                      {isAnyEditing && (
                        <div className="mt-4 flex w-full justify-end gap-2">
                          <Button
                            disabled={
                              updateEnterpriseMutation.isPending ||
                              updateEnterpriseFieldsMutation.isPending
                            }
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditing({
                                gst: false,
                                udyam: false,
                                mobile: false,
                                email: false,
                              });
                              setUpdateEnterpriseDetails({
                                identifierType: '',
                                identifierNum: '',
                              });
                              setEnterpriseDataUpdate(null);
                            }}
                          >
                            {translations('tabs.content.tab1.ctas.cancel')}
                          </Button>

                          <Button
                            disabled={
                              updateEnterpriseMutation.isPending ||
                              updateEnterpriseFieldsMutation.isPending
                            }
                            size="sm"
                            onClick={() => {
                              if (isEditing.email || isEditing.mobile) {
                                const isValidEmail = validateEmail(
                                  enterpriseDataUpdate?.email,
                                );
                                if (isValidEmail) {
                                  toast.error(
                                    'Please Enter a valid Email address',
                                  );
                                } else {
                                  updateEnterpriseFieldsMutation.mutate(
                                    enterpriseDataUpdate,
                                  );
                                }
                              } else {
                                updateEnterpriseMutation.mutate();
                              }
                            }}
                          >
                            {updateEnterpriseMutation.isPending ||
                            updateEnterpriseFieldsMutation.isPending ? (
                              <Loading />
                            ) : (
                              translations('tabs.content.tab1.ctas.update')
                            )}
                          </Button>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* RIGHT SIDE (1/3) */}
                  <div className="flex flex-col gap-4">
                    {/* CONTACT */}
                    <Card className="rounded-2xl border p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                          Contact
                        </h3>

                        <div className="flex items-center gap-2">
                          <Button disabled variant="outline" size="sm">
                            <Copy size={14} /> Copy link
                          </Button>
                          <Button disabled variant="outline" size="icon">
                            <QrCode size={16} />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                            <Mail size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              Email
                            </span>
                            <span className="text-sm font-semibold">
                              {enterprise?.email || 'contact@yourcompany.com'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                            <Phone size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              Phone
                            </span>
                            <span className="text-sm font-semibold">
                              +91 {enterprise?.mobileNumber || 'XXXXXXXXXX'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* LINKS */}
                    <Card className="rounded-2xl border p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Links
                      </h3>

                      <p className="mt-2 text-xs text-muted-foreground">
                        Official links shared by the enterprise.
                      </p>

                      <div className="mt-4 flex flex-col gap-3">
                        {links.map((link) => {
                          const Icon = link.icon;
                          return (
                            <div
                              key={link.label}
                              className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                  <Icon size={16} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground">
                                    {link.label}
                                  </span>
                                  <span className="max-w-[180px] truncate text-sm font-semibold">
                                    {link.value}
                                  </span>
                                </div>
                              </div>

                              <Button variant="outline" size="icon">
                                <ExternalLink size={16} />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Wrapper>
    </ProtectedWrapper>
  );
}

export default EnterpriseProfile;
