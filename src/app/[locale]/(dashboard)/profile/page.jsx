'use client';

import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { userAuth } from '@/api/user_auth/Users';
import { getInitialsNames, getRandomBgColor } from '@/appUtils/helperFunctions';
import GeneatePINModal from '@/components/Modals/GeneatePINModal';
import Tooltips from '@/components/auth/Tooltips';
import LanguagesSwitcher from '@/components/ui/LanguagesSwitcher';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { LocalStorageService } from '@/lib/utils';
import { updateEnterpriseIdentificationDetails } from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import {
  getProfileDetails,
  LoggingOut,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Info, Pencil, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function Profile() {
  const translations = useTranslations('profile');
  const queryClient = useQueryClient();
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const router = useRouter();
  const [bgColor, setBgColor] = useState('');
  const [tab, setTab] = useState('userOverview');
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
  };

  // logout mutation fn
  const logoutMutation = useMutation({
    mutationKey: [userAuth.logout.endpointKey],
    mutationFn: LoggingOut,
    onSuccess: (res) => {
      LocalStorageService.clear();
      router.push('/login');
      toast.success(
        res.data.message || translations('toasts.logout.successMsg'),
      );
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('toasts.logout.errorMsg'),
      );
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  // fetch profileDetails API
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled: tab === 'userOverview' || tab === 'enterpriseOverview',
  });

  useMetaData(
    `Hues! - ${profileDetails?.userDetails?.user?.name ?? 'Profile'}`,
    'HUES PROFILE',
  ); // dynamic title

  useEffect(() => {
    const bgColorClass = getRandomBgColor();
    setBgColor(bgColorClass);
  }, []);

  return (
    <Wrapper className="h-full gap-8">
      <SubHeader name="Profile">
        <Button
          size="sm"
          variant="blue_outline"
          onClick={logout}
          disabled={logoutMutation.isPending}
        >
          {translations('ctas.logout')}
        </Button>
      </SubHeader>

      <Tabs
        className="flex flex-col gap-4"
        value={tab}
        onValueChange={onTabChange}
        defaultValue={'userOverview'}
      >
        <TabsList className="w-fit border">
          <TabsTrigger value="userOverview">
            {translations('tabs.label.tab1')}
          </TabsTrigger>
          <TabsTrigger value="enterpriseOverview">
            {translations('tabs.label.tab2')}
          </TabsTrigger>
          <TabsTrigger value="languages">
            {translations('tabs.label.tab3')}
          </TabsTrigger>
          <TabsTrigger value="permissions">
            {translations('tabs.label.tab4')}
          </TabsTrigger>
          <TabsTrigger value="pinSettings">
            {translations('tabs.label.tab5')}
          </TabsTrigger>
        </TabsList>

        {/* ---checks : for if user skips */}
        {!profileDetails?.userDetails?.user?.isOnboardingCompleted &&
          !profileDetails?.userDetails?.user?.isPanVerified && (
            <div className="flex items-center justify-between rounded-md bg-[#288AF90A] p-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                <Info size={14} />
                {` Your onboarding is not complete yet, please complete it to unlock additional features.`}
              </span>
              <Button
                size="sm"
                className="h-8 bg-[#288AF9]"
                onClick={() => {
                  router.push('/login/user/pan-verification');
                }}
              >
                {translations('ctas.pendingActionsForCompletion.complete')}
              </Button>
            </div>
          )}

        {!profileDetails?.userDetails?.user?.isOnboardingCompleted &&
          profileDetails?.userDetails?.user?.isPanVerified &&
          !profileDetails?.userDetails?.user?.isAadhaarVerified && (
            <div className="flex items-center justify-between rounded-md bg-[#288AF90A] p-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                <Info size={14} />
                {` Your onboarding is not complete yet, please complete it to unlock additional features.`}
              </span>
              <Button
                size="sm"
                className="h-8 bg-[#288AF9]"
                onClick={() => {
                  router.push('/login/user/aadhar-verification');
                }}
              >
                {translations('ctas.pendingActionsForCompletion.complete')}
              </Button>
            </div>
          )}

        {profileDetails?.userDetails?.user?.isOnboardingCompleted &&
          !profileDetails?.enterpriseDetails?.isOnboardingCompleted && (
            <div className="flex items-center justify-between rounded-md bg-[#288AF90A] p-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                <Info size={14} />
                {` You have not completed your enterprise verification yet, please complete your enterprise verification to unlock additional features.`}
              </span>
              <Button
                size="sm"
                className="h-8 bg-[#288AF9]"
                onClick={() => {
                  router.push('/login/enterprise/pending-actions');
                }}
              >
                {translations('ctas.pendingActionsForCompletion.complete')}
              </Button>
            </div>
          )}

        {/* user details */}
        <TabsContent value="userOverview">
          {/* if userOnboarding is not completed */}
          {!profileDetails?.userDetails?.user?.isOnboardingCompleted && (
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
                  <span className="text-lg font-bold">{'Your Full Name'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.type')}
                  </Label>
                  <span className="text-lg font-bold">{'Individual'}</span>
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
                    {'youremail@gmail.com'}
                  </span>
                </div>
              </div>
            </div>
          )}
          {/* if userOnboarding is completed */}
          {profileDetails?.userDetails?.user?.isOnboardingCompleted && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between gap-2 rounded-sm border p-4">
                <div className="flex w-full items-center justify-start gap-4">
                  <div
                    className={`${bgColor} flex h-16 w-16 items-center justify-center rounded-full p-2 text-2xl text-white`}
                  >
                    {getInitialsNames(profileDetails?.userDetails?.user?.name)}
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
              <div className="grid grid-cols-3 grid-rows-2 gap-8 rounded-sm border p-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.pan')}
                  </Label>
                  <span className="text-lg font-bold">
                    {profileDetails?.userDetails?.user?.panNumber}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.name')}
                  </Label>
                  <span className="text-lg font-bold">
                    {profileDetails?.userDetails?.user?.name}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.type')}
                  </Label>
                  <span className="text-lg font-bold">{'Individual'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.mobile')}
                  </Label>
                  <span className="text-lg font-bold">
                    +91 {profileDetails?.userDetails?.user?.mobileNumber}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.email')}
                  </Label>
                  <span className="text-lg font-bold">
                    {profileDetails?.userDetails?.email ?? '-'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="enterpriseOverview">
          {/* if !enterpriseId is not completed */}
          {!profileDetails?.enterpriseDetails?.id && (
            <div className="relative">
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-sm bg-[#dedede88]"></div>
              <div className="grid grid-cols-3 grid-rows-2 gap-8 rounded-sm border p-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab2.label.pan')}
                  </Label>
                  <span className="text-lg font-bold">{'XXXXXX1234'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab2.label.name')}
                  </Label>
                  <span className="text-lg font-bold">
                    {'Your Enterprise Name'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab2.label.type')}
                  </Label>
                  <span className="text-lg font-bold">{'pvt. ltd.'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab2.label.mobile')}
                  </Label>
                  <span className="text-lg font-bold">+91 {'9876543210'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab2.label.email')}
                  </Label>
                  <span className="text-lg font-bold">
                    {'yourenterprise@gmail.com'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab2.label.gst')}
                  </Label>
                  <span className="text-lg font-bold">{'XXXXXXXXXXXX'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab2.label.udyam')}
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
                        'tabs.content.tab2.profilePicSection.title',
                      )}
                    </span>
                    <span className="text-xs text-grey">
                      {translations(
                        'tabs.content.tab2.profilePicSection.format',
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-end gap-2">
                  <Tooltips
                    trigger={
                      <Button size="sm" variant="blue_outline" disabled>
                        {translations(
                          'tabs.content.tab2.profilePicSection.ctas.upload',
                        )}
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />

                  <Tooltips
                    trigger={
                      <Button size="sm" variant="outline" disabled>
                        {translations(
                          'tabs.content.tab2.profilePicSection.ctas.delete',
                        )}
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-sm border p-4">
                <h1>{translations('tabs.content.tab2.heading1')}</h1>

                <div className="grid grid-cols-3 grid-rows-2 gap-8 p-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab2.label.name')}
                    </Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.name ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab2.label.type')}
                    </Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.type ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab2.label.mobile')}
                    </Label>
                    <span className="text-lg font-bold">
                      +91{' '}
                      {profileDetails?.enterpriseDetails?.mobileNumber ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab2.label.email')}
                    </Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.email ?? '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-sm border p-4">
                <h1>{translations('tabs.content.tab2.heading2')}</h1>

                <div className="grid grid-cols-3 grid-rows-1 gap-8 p-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">
                      {translations('tabs.content.tab2.label.pan')}
                    </Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.panNumber ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex w-full items-center gap-1">
                      <Label className="text-xs">
                        {translations('tabs.content.tab2.label.gst')}
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
                            'tabs.content.tab2.input.gst.placeholder',
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
                        {translations('tabs.content.tab2.label.udyam')}
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
                            'tabs.content.tab2.input.udyam.placeholder',
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
                      {translations('tabs.content.tab2.ctas.cancel')}
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
                        translations('tabs.content.tab2.ctas.update')
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="languages">
          <LanguagesSwitcher translations={translations} />
        </TabsContent>

        <TabsContent value="permissions">
          {translations('tabs.content.tab4.coming_soon')}
        </TabsContent>

        <TabsContent value="pinSettings">
          <GeneatePINModal isPINAvailable={profileDetails?.pinExists} />
        </TabsContent>
      </Tabs>
    </Wrapper>
  );
}

export default Profile;
