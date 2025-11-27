'use client';

import { bankAccountApis } from '@/api/bankAccounts/bankAccountsApi';
import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { pinSettings } from '@/api/pinsettings/pinsettingApi';
import { settingsAPI } from '@/api/settings/settingsApi';
import { userAuth } from '@/api/user_auth/Users';
import { validateEmail } from '@/appUtils/ValidationUtils';
import { capitalize, getEnterpriseId } from '@/appUtils/helperFunctions';
import GeneatePINModal from '@/components/Modals/GeneatePINModal';
import AddNewAddress from '@/components/enterprise/AddNewAddress';
import AccountDetails from '@/components/settings/AccountDetails';
import AddBankAccount from '@/components/settings/AddBankAccount';
import InvoiceSettings from '@/components/settings/InvoiceSettings';
import PaymentSettings from '@/components/settings/PaymentSettings';
import { DataTable } from '@/components/table/data-table';
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
import { getBankAccounts } from '@/services/BankAccount_Services/BankAccountServices';
import {
  updateEnterpriseFields,
  updateEnterpriseIdentificationDetails,
} from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { getPINLogs } from '@/services/Pin_Setting_Services/Pin_Settings_Services';
import {
  addUpdateAddress,
  createSettings,
  getSettingsByKey,
  getTemplateForSettings,
} from '@/services/Settings_Services/SettingsService';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Pencil, PencilIcon, PlusCircle, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usePINAuditLogsColumns } from './usePINAuditLogsColumns';

function Settings() {
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = getEnterpriseId();

  const translations = useTranslations('settings');
  const translationsTab4 = useTranslations(
    'components.generate_pin_modal.audit_logs',
  );
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = usePermission();
  // const [bgColor, setBgColor] = useState('');
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
  const [isBankAccountAdding, setIsBankAccountAdding] = useState(false);
  const [isAddressAdding, setIsAddressAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressId, setAddressId] = useState(null);
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
  // Handle tab change
  const onTabChange = (value) => {
    setTab(value);
    router.push(`/dashboard/settings?tab=${value || 'enterpriseOverview'}`); // update URL with query param
  };

  // get query param from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setTab(tabParam);
    }
  }, [searchParams]);

  // fetch profileDetails API
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled:
      tab === 'enterpriseOverview' &&
      hasPermission('permission:view-dashboard'),
  });

  useMetaData(`Settings -  ${capitalize(tab)}`, 'HUES SETTINGS'); // dynamic title

  // useEffect(() => {
  //   const bgColorClass = getRandomBgColor();
  //   setBgColor(bgColorClass);
  // }, []);

  // fetch settings - invoice
  const { data: invoiceSettings } = useQuery({
    queryKey: [settingsAPI.getSettingByKey.endpointKey],
    queryFn: () => getSettingsByKey('INVOICE'),
    select: (data) => data.data.data,
    enabled: tab === 'invoice' && hasPermission('permission:view-dashboard'),
  });

  // fetch settings - payment terms
  const { data: paymentTermsSettings } = useQuery({
    queryKey: [settingsAPI.getSettingByKey.endpointKey],
    queryFn: () => getSettingsByKey('PAYMENT_TERMS'),
    select: (data) => data.data.data,
    enabled:
      tab === 'paymentTerms' && hasPermission('permission:view-dashboard'),
  });

  const { data: templates } = useQuery({
    queryKey: [settingsAPI.getTemplateForSettings.endpointKey],
    queryFn: () => getTemplateForSettings(),
    select: (data) => data.data.data,
    enabled: tab === 'invoice' && hasPermission('permission:view-dashboard'),
  });

  const createSettingMutation = useMutation({
    mutationKey: [settingsAPI.createSettings.endpointKey],
    mutationFn: createSettings,
    onSuccess: () => {
      toast.success(
        translations('tabs.content.tab3.settingsUpdate.successMsg'),
      );
    },
    onError: (error) => {
      toast.error(
        error.response.data.message ||
          translations('tabs.content.tab3.settingsUpdate.errorMsg'),
      );
    },
  });

  // fetch pin audit logs
  const { data: pinAuditLogs } = useQuery({
    queryKey: [pinSettings.getPINLogs.endpointKey],
    queryFn: () => getPINLogs(),
    select: (data) => data.data.data,
    enabled:
      tab === 'pinSettings' && hasPermission('permission:view-dashboard'),
  });

  const PINAuditLogsColumns = usePINAuditLogsColumns();

  // getAccountsListing
  const { data: bankAccounts } = useQuery({
    queryKey: [bankAccountApis.getBankAccounts.endpointKey],
    queryFn: () => getBankAccounts(),
    select: (data) => data.data.data,
    enabled:
      tab === 'bankAccount' && hasPermission('permission:view-dashboard'),
  });

  return (
    <ProtectedWrapper permissionCode="permission:view-dashboard">
      <Wrapper className="h-full gap-8">
        <SubHeader name="Settings"></SubHeader>

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
            <TabsTrigger value="bankAccount">
              {translations('tabs.label.tab2')}
            </TabsTrigger>
            <TabsTrigger value="invoice">
              {translations('tabs.label.tab3')}
            </TabsTrigger>
            <TabsTrigger value="paymentTerms">
              {translations('tabs.label.tab4')}
            </TabsTrigger>
            <TabsTrigger value="offers">
              {translations('tabs.label.tab5')}
            </TabsTrigger>
            <TabsTrigger value="pinSettings">
              {translations('tabs.label.tab6')}
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
                {/* <div className="flex justify-between gap-2 rounded-sm border p-4">
                <div className="flex w-full items-center justify-start gap-4">
                  <div
                    className={`${bgColor} flex h-16 w-16 items-center justify-center rounded-full p-2 text-2xl text-white`}
                  >
                    {getInitialsNames(profileDetails?.enterpriseDetails?.name)}
                  </div>
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
                  <Tooltips
                    trigger={
                      <Button size="sm" variant="blue_outline" disabled>
                        {translations(
                          'tabs.content.tab1.profilePicSection.ctas.upload',
                        )}
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />

                  <Tooltips
                    trigger={
                      <Button size="sm" variant="outline" disabled>
                        {translations(
                          'tabs.content.tab1.profilePicSection.ctas.delete',
                        )}
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />
                </div>
              </div> */}
                <div className="mt-5 flex flex-col gap-4">
                  <h1 className="font-semibold uppercase text-primary">
                    {translations('tabs.content.tab1.heading1')}
                  </h1>

                  <div className="grid grid-cols-3 grid-rows-2 gap-8 p-2">
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
                                        setEditingAddress(addr.address);
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

                <div className="flex flex-col gap-4">
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

          <TabsContent value="bankAccount" className="flex flex-col gap-4">
            <div className="mt-5 flex w-full items-center justify-between gap-2 rounded-md border p-4">
              <div className="flex flex-col items-start gap-1 text-sm">
                <p className="font-bold">
                  {translations(
                    'tabs.content.tab2.bankAccount.add_bank_heading',
                  )}
                </p>
                <p className="text-gray-400">
                  {translations(
                    'tabs.content.tab2.bankAccount.add_bank_subtitle',
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="blue_outline"
                onClick={() => setIsBankAccountAdding(true)}
              >
                {translations('tabs.content.tab2.bankAccount.add_bank_button')}
              </Button>
            </div>
            <AddBankAccount
              isModalOpen={isBankAccountAdding}
              setIsModalOpen={setIsBankAccountAdding}
            />

            {bankAccounts?.length > 0 && (
              <>
                <h1 className="text-xl font-semibold">
                  {translations('tabs.content.tab2.bankAccount.list_heading')}
                </h1>
                <div className="flex w-full flex-wrap gap-3">
                  {bankAccounts?.map((account) => (
                    <AccountDetails key={account.id} account={account} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="invoice" className="flex flex-col gap-10">
            {/* {translations('tabs.content.tab4.coming_soon')} */}
            <InvoiceSettings
              settings={invoiceSettings}
              templates={templates}
              createSettingMutation={createSettingMutation}
            />
          </TabsContent>

          <TabsContent value="paymentTerms">
            <PaymentSettings
              settings={paymentTermsSettings}
              createSettingMutation={createSettingMutation}
            />
          </TabsContent>

          <TabsContent value="offers">
            {translations('tabs.content.tab5.coming_soon')}
          </TabsContent>

          <TabsContent value="pinSettings" className="flex flex-col gap-10">
            <GeneatePINModal isPINAvailable={profileDetails?.pinExists} />

            {pinAuditLogs?.length > 0 && (
              <div className="flex h-full flex-col gap-2">
                <h2 className="text-sm font-bold">
                  {translationsTab4('title')}
                </h2>
                <DataTable columns={PINAuditLogsColumns} data={pinAuditLogs} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Wrapper>
    </ProtectedWrapper>
  );
}

export default Settings;
