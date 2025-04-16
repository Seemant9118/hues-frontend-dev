'use client';

import { bankAccountApis } from '@/api/bankAccounts/bankAccountsApi';
import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { pinSettings } from '@/api/pinsettings/pinsettingApi';
import { userAuth } from '@/api/user_auth/Users';
import {
  capitalize,
  getInitialsNames,
  getRandomBgColor,
} from '@/appUtils/helperFunctions';
import GeneatePINModal from '@/components/Modals/GeneatePINModal';
import Tooltips from '@/components/auth/Tooltips';
import AccountDetails from '@/components/settings/AccountDetails';
import AddBankAccount from '@/components/settings/AddBankAccount';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { LocalStorageService } from '@/lib/utils';
import { getBankAccounts } from '@/services/BankAccount_Services/BankAccountServices';
import { updateEnterpriseIdentificationDetails } from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { getPINLogs } from '@/services/Pin_Setting_Services/Pin_Settings_Services';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usePINAuditLogsColumns } from './usePINAuditLogsColumns';

function Settings() {
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const translations = useTranslations('settings');
  const translationsTab4 = useTranslations(
    'components.generate_pin_modal.audit_logs',
  );
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bgColor, setBgColor] = useState('');
  const [tab, setTab] = useState('enterpriseOverview');
  const [isEditing, setIsEditing] = useState({
    gst: false,
    udyam: false,
  });
  const [updateEnterpriseDetails, setUpdateEnterpriseDetails] = useState({
    identifierType: '',
    identifierNum: '',
  });

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
  // Handle tab change
  const onTabChange = (value) => {
    setTab(value);
    router.push(`/settings?tab=${value || 'enterpriseOverview'}`); // update URL with query param
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
    enabled: tab === 'enterpriseOverview',
  });

  useMetaData(`Settings -  ${capitalize(tab)}`, 'HUES SETTINGS'); // dynamic title

  useEffect(() => {
    const bgColorClass = getRandomBgColor();
    setBgColor(bgColorClass);
  }, []);

  // fetch pin audit logs
  const { data: pinAuditLogs } = useQuery({
    queryKey: [pinSettings.getPINLogs.endpointKey],
    queryFn: () => getPINLogs(),
    select: (data) => data.data.data,
    enabled: tab === 'pinSettings',
  });

  const PINAuditLogsColumns = usePINAuditLogsColumns();

  // getAccountsListing
  const { data: bankAccounts } = useQuery({
    queryKey: [bankAccountApis.getBankAccounts.endpointKey],
    queryFn: () => getBankAccounts(),
    select: (data) => data.data.data,
    enabled: tab === 'bankAccount',
  });

  return (
    <Wrapper className="h-full gap-8">
      <SubHeader name="Settings"></SubHeader>

      <Tabs
        className="flex flex-col gap-4"
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
          <TabsTrigger value="invoices">
            {translations('tabs.label.tab3')}
          </TabsTrigger>
          <TabsTrigger value="offers">
            {translations('tabs.label.tab4')}
          </TabsTrigger>
          <TabsTrigger value="pinSettings">
            {translations('tabs.label.tab5')}
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
                  <span className="text-lg font-bold">+91 {'9876543210'}</span>
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
              <div className="flex justify-between gap-2 rounded-sm border p-4">
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
              </div>
              <div className="flex flex-col gap-4 rounded-sm p-4">
                <h1 className="font-semibold uppercase text-primary">
                  {translations('tabs.content.tab1.heading1')}
                </h1>

                <div className="grid grid-cols-3 grid-rows-2 gap-8 p-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.name')}
                    </Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.name ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.type')}
                    </Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.type ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.mobile')}
                    </Label>
                    <span className="text-lg font-bold">
                      +91{' '}
                      {profileDetails?.enterpriseDetails?.mobileNumber ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.email')}
                    </Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.email ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.address')}
                    </Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.address ?? '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-sm p-4">
                <h1 className="font-semibold uppercase text-primary">
                  {translations('tabs.content.tab1.heading2')}
                </h1>

                <div className="grid grid-cols-3 grid-rows-1 gap-8 p-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab1.label.pan')}
                    </Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.panNumber ?? '-'}
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
                {(isEditing.gst || isEditing.udyam) && (
                  <div className="flex w-full justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing({
                          gst: false,
                          udyam: false,
                        });
                        setUpdateEnterpriseDetails({
                          identifierType: '',
                          identifierNum: '',
                        }); // input data cleared
                      }}
                    >
                      {translations('tabs.content.tab1.ctas.cancel')}
                    </Button>
                    <Button
                      disabled={updateEnterpriseMutation.isPending}
                      size="sm"
                      onClick={() => {
                        updateEnterpriseMutation.mutate();
                      }}
                    >
                      {' '}
                      {updateEnterpriseMutation.isPending ? (
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
          <AddBankAccount />

          {bankAccounts?.length > 0 && (
            <>
              <h1 className="text-xl font-semibold">Bank Accounts</h1>
              <div className="flex w-full flex-wrap gap-3">
                {bankAccounts?.map((account) => (
                  <AccountDetails key={account.id} account={account} />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="invoices">
          {translations('tabs.content.tab4.coming_soon')}
        </TabsContent>

        <TabsContent value="offers">
          {translations('tabs.content.tab4.coming_soon')}
        </TabsContent>

        <TabsContent value="pinSettings" className="flex flex-col gap-10">
          <GeneatePINModal isPINAvailable={profileDetails?.pinExists} />

          {pinAuditLogs?.length > 0 && (
            <div className="flex h-full flex-col gap-2">
              <h2 className="text-sm font-bold">{translationsTab4('title')}</h2>
              <DataTable columns={PINAuditLogsColumns} data={pinAuditLogs} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Wrapper>
  );
}

export default Settings;
