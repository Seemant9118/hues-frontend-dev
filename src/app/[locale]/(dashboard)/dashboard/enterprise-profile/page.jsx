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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  addUpdateAddress,
  uploadLogo,
} from '@/services/Settings_Services/SettingsService';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Pencil,
  PencilIcon,
  PlusCircle,
  Settings,
  Upload,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

function EnterpriseProfile() {
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = getEnterpriseId();
  useMetaData(`Enterprise Profile`, 'HUES ENTEPRRISE PROFILE'); // dynamic title

  const translations = useTranslations('settings');

  const queryClient = useQueryClient();
  const router = useRouter();
  const fileInputRef = useRef(null);
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

  // Handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
      setUpdateEnterpriseDetails({
        identifierType: '',
        identifierNum: '',
      }); // reset input field
      setIsEditing({
        gst: false,
        udyam: false,
        mobile: false,
        email: false,
      }); // reset bool state
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
      setEnterpriseDataUpdate(null); // reset input field
      setIsEditing({
        gst: false,
        udyam: false,
        mobile: false,
        email: false,
      }); // reset bool state
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

  const pvtUrl = profileDetails?.enterpriseDetails?.logoUrl;
  // Fetch the PDF document using react-query
  const { data: publicUrl } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, pvtUrl],
    queryFn: () => getDocument(pvtUrl),
    enabled: !!pvtUrl, // Only fetch if pvtUrl is available
    select: (res) => res.data.data,
  });

  const uploadLogoMutation = useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => {
      toast.success(translations('tabs.content.tab1.toasts.logo.successMsg'));
      queryClient.invalidateQueries([userAuth.getProfileDetails.endpointKey]);
    },
    onError: () => {
      toast.error(translations('tabs.content.tab1.toasts.logo.errorMsg'));
    },
  });

  const uploadFile = (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    uploadLogoMutation.mutate({ data: formData });
  };

  return (
    <ProtectedWrapper permissionCode="permission:view-dashboard">
      <Wrapper className="h-full">
        <SubHeader name={translations('title')}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push(`/dashboard/enterprise-profile/settings`);
            }}
          >
            <Settings size={14} /> Settings
          </Button>
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
            {/* if !enterpriseId is not completed */}
            {!profileDetails?.enterpriseDetails?.id && (
              <div className="relative">
                <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-sm bg-[#dedede88]"></div>
                <div className="grid grid-cols-3 grid-rows-2 gap-8 rounded-sm border p-4">
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
            {/* if enterpriseOnboardingComplete */}
            {profileDetails?.enterpriseDetails?.id && (
              <div className="flex flex-col gap-4">
                {/* logo */}
                <div className="mt-4 flex justify-between gap-2 rounded-sm border p-4">
                  <div className="flex w-full items-center justify-start gap-4">
                    {profileDetails?.enterpriseDetails?.logoUrl ? (
                      <Image
                        src={publicUrl?.publicUrl}
                        alt="logo"
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <Avatar name={profileDetails?.enterpriseDetails?.name} />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">
                        {translations(
                          'tabs.content.tab1.profilePicSection.title',
                        )}
                      </span>
                      <span className="text-xs text-grey">
                        {translations(
                          'tabs.content.tab1.profilePicSection.format',
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-end gap-2">
                    <>
                      <input
                        id="logoUpload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={(e) => uploadFile(e.target.files[0])}
                        className="hidden"
                      />

                      <label htmlFor="logoUpload">
                        <Button
                          debounceTime={1000}
                          size="sm"
                          variant="blue_outline"
                          type="button"
                          onClick={openFilePicker}
                        >
                          <span className="flex items-center gap-1">
                            <Upload size={16} />
                            {profileDetails?.enterpriseDetails?.logoUrl
                              ? translations(
                                  'tabs.content.tab1.profilePicSection.ctas.update',
                                )
                              : translations(
                                  'tabs.content.tab1.profilePicSection.ctas.upload',
                                )}
                          </span>
                        </Button>
                      </label>
                    </>
                  </div>
                </div>
                {/* Enterprise Information */}
                <div className="mt-5 flex flex-col gap-4">
                  <h1 className="font-semibold uppercase text-primary">
                    {translations('tabs.content.tab1.heading1')}
                  </h1>

                  <div className="grid grid-cols-3 grid-rows-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">
                        {translations('tabs.content.tab1.label.name')}
                      </Label>
                      <span className="text-lg font-bold">
                        {profileDetails?.enterpriseDetails?.name || '-'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">
                        {translations('tabs.content.tab1.label.type')}
                      </Label>
                      <span className="text-lg font-bold">
                        {capitalize(profileDetails?.enterpriseDetails?.type) ||
                          '-'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
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
                                mobileNumber:
                                  profileDetails?.enterpriseDetails
                                    ?.mobileNumber,
                              }));
                            }}
                          />
                        )}
                      </div>

                      {isEditing.mobile ? (
                        <Input
                          type="number"
                          placeholder="+91 XXXXXXXXXX"
                          value={enterpriseDataUpdate.mobileNumber}
                          onChange={(e) =>
                            setEnterpriseDataUpdate((prev) => ({
                              ...prev,
                              mobileNumber: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <span className="text-lg font-bold">
                          +91{' '}
                          {profileDetails?.enterpriseDetails?.mobileNumber ||
                            '-'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
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
                                email: profileDetails?.enterpriseDetails?.email,
                              }));
                            }}
                          />
                        )}
                      </div>

                      {isEditing.email ? (
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={enterpriseDataUpdate.email}
                          onChange={(e) =>
                            setEnterpriseDataUpdate((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <span className="text-lg font-bold">
                          {profileDetails?.enterpriseDetails?.email || '-'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
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
                        mutationKey={settingsAPI.addUpdateAddress.endpointKey}
                        mutationFn={addUpdateAddress}
                        invalidateKey={userAuth.getProfileDetails.endpointKey}
                        editingAddress={editingAddress}
                        setEditingAddress={setEditingAddress}
                        editingAddressId={addressId}
                        setEditingAddressId={setAddressId}
                      />
                      <div className="scrollBarStyles mt-1 flex max-h-[100px] flex-col gap-2 overflow-auto">
                        {profileDetails?.enterpriseDetails?.addressList
                          ?.length > 0 ? (
                          profileDetails?.enterpriseDetails?.addressList.map(
                            (addr) => {
                              return (
                                <div
                                  key={addr.id}
                                  className="flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 pr-6"
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

                                  <div className="relative flex gap-1">
                                    <button
                                      className={
                                        isEditing
                                          ? 'text-primary'
                                          : 'text-black'
                                      }
                                      onClick={() => {
                                        setIsAddressAdding(true);
                                        setEditingAddress(addr);
                                        setAddressId(addr.id);
                                      }}
                                    >
                                      <PencilIcon size={12} />
                                    </button>
                                  </div>
                                </div>
                              );
                            },
                          )
                        ) : (
                          <p className="text-sm font-medium text-gray-500">-</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Business Identification */}
                <div className="flex flex-col">
                  <h1 className="font-semibold uppercase text-primary">
                    {translations('tabs.content.tab1.heading2')}
                  </h1>

                  <div className="grid grid-cols-3 grid-rows-1 gap-8 p-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">
                        {translations('tabs.content.tab1.label.pan')}
                      </Label>
                      <span className="text-lg font-bold">
                        {profileDetails?.enterpriseDetails?.panNumber || '-'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex w-full items-center gap-1">
                        <Label className="text-xs">
                          {translations('tabs.content.tab1.label.gst')}
                        </Label>

                        {!profileDetails?.enterpriseDetails?.gstNumber &&
                        !isEditing.udyam ? (
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
                                }); // input data cleared
                              }}
                            />
                          ) : (
                            <Pencil
                              size={12}
                              className="cursor-pointer"
                              data-testid="edit-gst"
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

                      <span className="text-lg font-bold">
                        {isEditing.gst && (
                          <Input
                            type="text"
                            placeholder={translations(
                              'tabs.content.tab1.input.gst.placeholder',
                            )}
                            value={updateEnterpriseDetails?.identifierNum || ''}
                            onChange={(e) => {
                              setUpdateEnterpriseDetails((prev) => ({
                                ...prev,
                                identifierType: 'gst',
                                identifierNum: e.target.value,
                              }));
                            }}
                          />
                        )}
                        {!isEditing.gst &&
                        profileDetails?.enterpriseDetails?.gstNumber === ''
                          ? '-'
                          : profileDetails?.enterpriseDetails?.gstNumber}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex w-full items-center gap-1">
                        <Label className="text-xs">
                          {translations('tabs.content.tab1.label.udyam')}
                        </Label>
                        {!profileDetails?.enterpriseDetails?.udyam &&
                        !isEditing.gst ? (
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
                                }); // input data cleared
                              }}
                            />
                          ) : (
                            <Pencil
                              size={12}
                              className="cursor-pointer"
                              data-testid="edit-udyam"
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
                      <span className="text-lg font-bold">
                        {isEditing.udyam && (
                          <Input
                            type="text"
                            placeholder={translations(
                              'tabs.content.tab1.input.udyam.placeholder',
                            )}
                            value={updateEnterpriseDetails?.identifierNum || ''}
                            onChange={(e) => {
                              setUpdateEnterpriseDetails((prev) => ({
                                ...prev,
                                identifierType: 'udyam',
                                identifierNum: e.target.value,
                              }));
                            }}
                          />
                        )}
                        {!isEditing.udyam &&
                        profileDetails?.enterpriseDetails?.udyam === ''
                          ? '-'
                          : profileDetails?.enterpriseDetails?.udyam}
                      </span>
                    </div>
                  </div>
                  {(isEditing.gst ||
                    isEditing.udyam ||
                    isEditing.mobile ||
                    isEditing.email) && (
                    <div className="flex w-full justify-end gap-2">
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
                          }); // input data cleared\

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
                              toast.error('Please Enter a valid Email address');
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
