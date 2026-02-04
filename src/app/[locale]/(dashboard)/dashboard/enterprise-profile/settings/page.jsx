'use client';

import { bankAccountApis } from '@/api/bankAccounts/bankAccountsApi';
import { pinSettings } from '@/api/pinsettings/pinsettingApi';
import { settingsAPI } from '@/api/settings/settingsApi';
import { userAuth } from '@/api/user_auth/Users';
import GeneratePINModal from '@/components/Modals/GeneatePINModal';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import AccountDetails from '@/components/settings/AccountDetails';
import AddBankAccount from '@/components/settings/AddBankAccount';
import AddEWBConfig from '@/components/settings/AddEWBConfig';
import EnterpriseSettings from '@/components/settings/EnterpriseSettings';
import EwbConfigDetails from '@/components/settings/EWBConfigDetails';
import InvoiceSettings from '@/components/settings/InvoiceSettings';
import PaymentSettings from '@/components/settings/PaymentSettings';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import { getBankAccounts } from '@/services/BankAccount_Services/BankAccountServices';
import { getPINLogs } from '@/services/Pin_Setting_Services/Pin_Settings_Services';
import {
  createSettings,
  getSettingsByKey,
  getTemplateForSettings,
} from '@/services/Settings_Services/SettingsService';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import GstRegistrations from '@/components/settings/GSTRegistrationsSettings';
import { usePINAuditLogsColumns } from '../usePINAuditLogsColumns';

const TAB_CONTEXT_MAP = {
  invoice: 'INVOICE',
  paymentTerms: 'PAYMENT_TERMS',
  ewb: 'EWAYBILL_CREDS',
};

const Settings = () => {
  const userId = LocalStorageService.get('user_profile');

  const translations = useTranslations('settings');
  const translationsTab4 = useTranslations(
    'components.generate_pin_modal.audit_logs',
  );
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState('enterprise');
  const [context, setContext] = useState();
  const [isBankAccountAdding, setIsBankAccountAdding] = useState(false);
  const [isEWBConfigAdding, setIsEWBConfigAdded] = useState(false);
  const [editedEWBConfig, setEditedEWBConfig] = useState(null);

  const onTabChange = (value) => {
    setTab(value);

    const mappedContext = TAB_CONTEXT_MAP[value];
    setContext(mappedContext);

    router.push(
      `/dashboard/enterprise-profile/settings?tab=${value || 'enterprise'}`,
    );
  };

  const settingsBreadCrumbs = [
    {
      id: 1,
      name: 'settings.title',
      path: '/dashboard/enterprise-profile/',
      show: true,
    },
    {
      id: 1,
      name: 'settings.title2',
      path: '/dashboard/enterprise-profile/settings',
      show: true,
    },
  ];

  // get query param from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const mappedContext = TAB_CONTEXT_MAP[tab];
    setContext(mappedContext);
  }, [tab]);
  // api - fetch Bank Accounts Listing on bank account tab
  const { data: bankAccounts } = useQuery({
    queryKey: [bankAccountApis.getBankAccounts.endpointKey],
    queryFn: () => getBankAccounts(),
    select: (data) => data.data.data,
    enabled:
      tab === 'bankAccount' && hasPermission('permission:view-dashboard'),
  });

  // api - fetch setting - on context basis
  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: [settingsAPI.getSettingByKey.endpointKey, context],
    queryFn: () => getSettingsByKey(context),
    select: (data) => data.data.data,
    enabled: !!context && hasPermission('permission:view-dashboard'),
  });

  // api - fetch templates - on invoice tab
  const { data: templates } = useQuery({
    queryKey: [settingsAPI.getTemplateForSettings.endpointKey],
    queryFn: () => getTemplateForSettings(),
    select: (data) => data.data.data,
    enabled: tab === 'invoice' && hasPermission('permission:view-dashboard'),
  });

  // api - mutation - create/update settings
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

  const normalizeEwbSettings = (settingsArray = []) => {
    return settingsArray.reduce((acc, item) => {
      const key = item.key?.replace('ewaybillcreds.', '');
      acc[key] = item.value;
      return acc;
    }, {});
  };

  // api - fetch profileDetails API
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled:
      tab === 'pinSettings' && hasPermission('permission:view-dashboard'),
  });

  // api - fetch pin audit logs
  const { data: pinAuditLogs } = useQuery({
    queryKey: [pinSettings.getPINLogs.endpointKey],
    queryFn: () => getPINLogs(),
    select: (data) => data.data.data,
    enabled:
      tab === 'pinSettings' && hasPermission('permission:view-dashboard'),
  });
  // columns for pin audit logs table
  const PINAuditLogsColumns = usePINAuditLogsColumns();

  return (
    <ProtectedWrapper permissionCode="permission:view-dashboard">
      <Wrapper className="h-full">
        <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-4">
          <div className="flex items-center gap-2">
            <ArrowLeft
              size={20}
              className="cursor-pointer hover:bg-accent"
              onClick={() => router.push(`/dashboard/enterprise-profile`)}
            />
            <OrderBreadCrumbs possiblePagesBreadcrumbs={settingsBreadCrumbs} />
          </div>
        </section>

        <Tabs
          className="flex flex-col"
          value={tab}
          onValueChange={onTabChange}
          defaultValue={'bankAccount'}
        >
          <TabsList className="w-fit border">
            <TabsTrigger value="enterprise">
              {translations('tabs.label.tab1')}
            </TabsTrigger>
            <TabsTrigger value="gstRegistration">
              {translations('tabs.label.tab2')}
            </TabsTrigger>
            <TabsTrigger value="bankAccount">
              {translations('tabs.label.tab3')}
            </TabsTrigger>
            <TabsTrigger value="invoice">
              {translations('tabs.label.tab4')}
            </TabsTrigger>
            <TabsTrigger value="paymentTerms">
              {translations('tabs.label.tab5')}
            </TabsTrigger>
            <TabsTrigger value="offers">
              {translations('tabs.label.tab6')}
            </TabsTrigger>
            <TabsTrigger value="ewb">
              {translations('tabs.label.tab7')}
            </TabsTrigger>
            <TabsTrigger value="pinSettings">
              {translations('tabs.label.tab8')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enterprise" className="flex flex-col gap-10">
            <EnterpriseSettings
              translations={translations}
              queryClient={queryClient}
              profileDetails={profileDetails}
            />
          </TabsContent>

          <TabsContent value="gstRegistration" className="">
            <GstRegistrations />
          </TabsContent>

          <TabsContent value="bankAccount" className="flex flex-col gap-4">
            <div className="flex w-full items-center justify-between gap-2 rounded-md border p-4">
              <div className="flex flex-col items-start gap-1 text-sm">
                <p className="font-bold">
                  {translations(
                    'tabs.content.tab3.bankAccount.add_bank_heading',
                  )}
                </p>
                <p className="text-gray-400">
                  {translations(
                    'tabs.content.tab3.bankAccount.add_bank_subtitle',
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="blue_outline"
                onClick={() => setIsBankAccountAdding(true)}
              >
                {translations('tabs.content.tab3.bankAccount.add_bank_button')}
              </Button>
            </div>
            <AddBankAccount
              isModalOpen={isBankAccountAdding}
              setIsModalOpen={setIsBankAccountAdding}
            />

            {bankAccounts?.length > 0 && (
              <>
                <h1 className="text-xl font-semibold">
                  {translations('tabs.content.tab3.bankAccount.list_heading')}
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
              settings={settings}
              templates={templates}
              createSettingMutation={createSettingMutation}
            />
          </TabsContent>

          <TabsContent value="paymentTerms">
            <PaymentSettings
              settings={settings}
              createSettingMutation={createSettingMutation}
            />
          </TabsContent>

          <TabsContent value="offers">
            {translations('tabs.content.tab6.coming_soon')}
          </TabsContent>

          <TabsContent value="ewb">
            {settings === null && (
              <div className="flex w-full items-center justify-between gap-2 rounded-md border p-4">
                <div className="flex flex-col items-start gap-1 text-sm">
                  <p className="font-bold">
                    {translations(
                      'tabs.content.tab7.ewbConfig.add_ewbConfig_heading',
                    )}
                  </p>
                  <p className="text-gray-400">
                    {translations(
                      'tabs.content.tab7.ewbConfig.add_ewbConfig_subtitle',
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="blue_outline"
                  onClick={() => setIsEWBConfigAdded(true)}
                >
                  {translations(
                    'tabs.content.tab7.ewbConfig.add_ewbConfig_button',
                  )}
                </Button>
              </div>
            )}

            <AddEWBConfig
              open={isEWBConfigAdding}
              onOpenChange={setIsEWBConfigAdded}
              refetch={refetchSettings}
              editedEWBConfig={editedEWBConfig}
              setEditedEWBConfig={setEditedEWBConfig}
            />

            {/* show ewb configuration */}
            {settings?.settings?.length > 0 && (
              <div className="flex w-full flex-wrap gap-3">
                <EwbConfigDetails
                  config={normalizeEwbSettings(settings.settings)}
                  setIsEWBConfigAdded={setIsEWBConfigAdded}
                  setEditedEWBConfig={setEditedEWBConfig}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="pinSettings" className="flex flex-col gap-10">
            <GeneratePINModal isPINAvailable={profileDetails?.pinExists} />

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
};

export default Settings;
