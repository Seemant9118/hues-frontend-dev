'use client';

import { userAuth } from '@/api/user_auth/Users';
import { validateEmail } from '@/appUtils/ValidationUtils';
import {
  capitalize,
  convertSnakeToTitleCase,
  formatDate,
  roleColors,
} from '@/appUtils/helperFunctions';
import ErrorBox from '@/components/ui/ErrorBox';
import LanguagesSwitcher from '@/components/ui/LanguagesSwitcher';
import Loading from '@/components/ui/Loading';
import Overview from '@/components/ui/Overview';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { cn, LocalStorageService, SessionStorageService } from '@/lib/utils';
import {
  getProfileDetails,
  getUserAccounts,
  LoggingOut,
  userUpdateFields,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Info,
  Lock,
  LogOut,
  Pencil,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

function Profile() {
  const queryClient = useQueryClient();
  const translations = useTranslations('profile');
  const translationsForError = useTranslations();
  const userId = LocalStorageService.get('user_profile');

  const router = useRouter();
  const [tab, setTab] = useState('userOverview');
  const [isEmailUpdating, setIsEmailUpdating] = useState(false);
  const [userDataUpdate, setUserDataUpdate] = useState({
    email: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  // update enterprise mutation
  const updateUserFieldsMutation = useMutation({
    mutationKey: [userAuth.userUpdateFields.endpointKey],
    mutationFn: userUpdateFields,
    onSuccess: () => {
      toast.success(translations('toasts.userUpdateFileds.successMsg'));
      setIsEmailUpdating(false);
      setUserDataUpdate({ email: '' }); // clear input
      setErrorMsg('');
      queryClient.invalidateQueries([userAuth.getProfileDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(
        error.response.data.message ||
          translations('toasts.userUpdateFileds.errorMsg'),
      );
    },
  });

  // logout mutation fn
  const logoutMutation = useMutation({
    mutationKey: [userAuth.logout.endpointKey],
    mutationFn: LoggingOut,
    onSuccess: (res) => {
      // Clear session immediately so logout is guaranteed
      LocalStorageService.clear();
      SessionStorageService.clear();
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

  // fetch profileDetails API (enabled for all profile tabs to keep data consistent)
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled: !!userId,
  });

  // fetch user accounts API (Associations tab only)
  const { data: userAccounts, isLoading: isAccountsLoading } = useQuery({
    queryKey: [userAuth.getUserAccounts.endpointKey],
    queryFn: () => getUserAccounts(),
    select: (data) => data.data.data,
    enabled: tab === 'associations',
  });

  useMetaData(
    `Hues! - ${profileDetails?.userDetails?.user?.name ?? 'Profile'}`,
    'HUES PROFILE',
  ); // dynamic title

  // Extract variables for easier rendering
  const userName = profileDetails?.userDetails?.user?.name || '-';
  const userPan = profileDetails?.userDetails?.user?.panNumber || '-';
  const userMobile = profileDetails?.userDetails?.user?.mobileNumber
    ? `${profileDetails?.userDetails?.user?.countryCode || '+91'} ${profileDetails?.userDetails?.user?.mobileNumber}`
    : '-';
  const userEmail = profileDetails?.userDetails?.email || '-';
  const enterpriseName = profileDetails?.enterpriseDetails?.name || '-';

  return (
    <Wrapper className="h-full">
      <SubHeader name="Profile">
        <Button
          size="sm"
          variant="outline"
          className="border-red-500 text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white"
          onClick={logout}
          disabled={logoutMutation.isPending}
        >
          <LogOut size={14} />
          {translations('ctas.logout')}
        </Button>
      </SubHeader>

      <Tabs
        value={tab}
        onValueChange={onTabChange}
        defaultValue={'userOverview'}
      >
        <TabsList>
          <TabsTrigger value="userOverview">
            {translations('tabs.label.tab1')}
          </TabsTrigger>
          <TabsTrigger value="languages">
            {translations('tabs.label.tab2')}
          </TabsTrigger>
          <TabsTrigger value="personalInformation">
            {translations('tabs.label.tab3')}
          </TabsTrigger>
          <TabsTrigger value="contactInformation">
            {translations('tabs.label.tab4')}
          </TabsTrigger>
          <TabsTrigger value="associations">
            {translations('tabs.label.tab5')}
          </TabsTrigger>
          <TabsTrigger value="additionalInformation">
            {translations('tabs.label.tab6')}
          </TabsTrigger>
        </TabsList>

        {/* ---checks : for if user skips (Do NOT touch pending actions logic) */}
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

        {/* Overview Tab Content */}
        <TabsContent value="userOverview">
          <div className="flex flex-col gap-3">
            {/* if userOnboarding is not completed */}
            {!profileDetails?.userDetails?.user?.isOnboardingCompleted ? (
              <div className="relative">
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-200/50 backdrop-blur-[1px]">
                  <Lock size={24} className="text-gray-400" />
                </div>
                <Overview
                  data={{
                    name: 'Your Full Name',
                    panCardNumber: 'XXXXXX1234',
                    mobileNumber: '+91 9876543210',
                    emailAddress: 'youremail@gmail.com',
                    entities: 'Individual',
                    primaryRole: 'Admin',
                  }}
                  labelMap={{
                    name: 'Full Name',
                    panCardNumber: 'PAN Card Number',
                    mobileNumber: 'Mobile Number',
                    emailAddress: 'Email Address',
                    entities: 'Entities',
                    primaryRole: 'Primary Role',
                  }}
                  sectionClass="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 w-full"
                />
              </div>
            ) : (
              /* if userOnboarding is completed */
              <Overview
                data={{
                  name: capitalize(userName),
                  panCardNumber: userPan,
                  mobileNumber: userMobile,
                  emailAddress: userEmail,
                  entities: enterpriseName,
                }}
                labelMap={{
                  name: 'Full Name',
                  panCardNumber: 'PAN Card Number',
                  mobileNumber: 'Mobile Number',
                  emailAddress: 'Email Address',
                  entities: 'Entities',
                }}
                sectionClass="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 w-full"
              />
            )}
          </div>
        </TabsContent>

        {/* Languages Tab Content */}
        <TabsContent value="languages">
          {!profileDetails?.userDetails?.user?.isOnboardingCompleted ? (
            <div className="relative">
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-200/50 backdrop-blur-[1px]">
                <Lock size={24} className="text-gray-400" />
              </div>
              <div className="flex flex-col gap-6 rounded-sm border border-gray-100 bg-[#F8F9FA] p-6">
                <LanguagesSwitcher translations={translations} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 rounded-sm border border-gray-100 bg-[#F8F9FA] p-6">
              <LanguagesSwitcher translations={translations} />
            </div>
          )}
        </TabsContent>

        {/* Personal Information Tab Content */}
        <TabsContent value="personalInformation">
          <div className="flex flex-col gap-3">
            {!profileDetails?.userDetails?.user?.isOnboardingCompleted ? (
              <div className="relative">
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-200/50 backdrop-blur-[1px]">
                  <Lock size={24} className="text-gray-400" />
                </div>
                <div className="flex flex-col gap-4 rounded-sm border border-gray-100 bg-[#F8F9FA] p-6">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                    <div className="flex items-center justify-between rounded-sm border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:shadow-md">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500">
                          Full Name
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          Your Full Name
                        </span>
                      </div>
                      <Lock size={15} className="text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between rounded-sm border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:shadow-md">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500">
                          Date of Birth
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          -
                        </span>
                      </div>
                      <Lock size={15} className="text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between rounded-sm border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:shadow-md">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500">
                          PAN Number
                        </span>
                        <span className="text-sm font-semibold uppercase text-gray-900">
                          XXXXXX1234
                        </span>
                      </div>
                      <Lock size={15} className="text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between rounded-sm border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:shadow-md">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500">
                          Aadhaar Number (Masked)
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          Not Verified
                        </span>
                      </div>
                      <Lock size={15} className="text-gray-400" />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2 border-t border-gray-200/60 pt-4 text-xs text-gray-500">
                    <Lock size={13} className="text-gray-400" />
                    <span>
                      These fields are verified via PAN and cannot be edited
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-sm border border-gray-100 bg-[#F8F9FA] p-6">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-sm border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500">
                        Full Name
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {capitalize(userName || '')}
                      </span>
                    </div>
                    <Lock size={15} className="text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between rounded-sm border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500">
                        Date of Birth
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        -
                      </span>
                    </div>
                    <Lock size={15} className="text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between rounded-sm border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500">
                        PAN Number
                      </span>
                      <span className="text-sm font-semibold uppercase text-gray-900">
                        {userPan}
                      </span>
                    </div>
                    <Lock size={15} className="text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between rounded-sm border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500">
                        Aadhaar Number (Masked)
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {profileDetails?.userDetails?.user?.isAadhaarVerified
                          ? '-'
                          : 'Not Verified'}
                      </span>
                    </div>
                    <Lock size={15} className="text-gray-400" />
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2 border-t border-gray-200/60 pt-4 text-xs text-gray-500">
                  <Lock size={13} className="text-gray-400" />
                  <span>
                    These fields are verified via PAN and cannot be edited
                  </span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Contact Information Tab Content */}
        <TabsContent value="contactInformation">
          <div className="flex flex-col gap-3">
            {!profileDetails?.userDetails?.user?.isOnboardingCompleted ? (
              <div className="relative">
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-200/50 backdrop-blur-[1px]">
                  <Lock size={24} className="text-gray-400" />
                </div>
                {/* Email Address Panel */}
                <div className="flex items-start justify-between gap-4 rounded-sm border border-gray-100 bg-[#F8F9FA] p-5">
                  <div className="flex w-full flex-col gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">
                        Email Address
                      </span>
                      <span className="inline-flex items-center gap-1 border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                        <AlertCircle size={10} className="text-gray-400" /> Not
                        Verified
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      youremail@gmail.com
                    </span>
                  </div>
                </div>

                {/* Mobile Number Panel */}
                <div className="flex items-start justify-between gap-4 rounded-sm border border-gray-100 bg-[#F8F9FA] p-5">
                  <div className="flex w-full flex-col gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      Mobile Number
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      +91 9876543210
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Email Address Panel */}
                <div className="flex items-start justify-between gap-4 rounded-sm border border-gray-100 bg-[#F8F9FA] p-5">
                  <div className="flex w-full flex-col gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">
                        Email Address
                      </span>
                      {profileDetails?.userDetails?.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                          <AlertCircle size={10} className="text-gray-400" />{' '}
                          Not Verified
                        </span>
                      )}
                    </div>

                    {isEmailUpdating ? (
                      <div className="flex w-full max-w-md flex-col gap-2">
                        <Input
                          type="email"
                          placeholder={'example@gmail.com'}
                          value={userDataUpdate.email}
                          onChange={(e) =>
                            setUserDataUpdate((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="h-9 text-xs"
                        />
                        {errorMsg && (
                          <ErrorBox msg={translationsForError(errorMsg)} />
                        )}
                        <div className="mt-1 flex justify-end gap-2">
                          <Button
                            disabled={updateUserFieldsMutation?.isPending}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={() => {
                              setErrorMsg('');
                              setIsEmailUpdating(false);
                              setUserDataUpdate({ email: '' });
                            }}
                          >
                            {translations('tabs.content.tab1.ctas.cancel')}
                          </Button>
                          <Button
                            disabled={updateUserFieldsMutation?.isPending}
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={() => {
                              const isValidEmail = validateEmail(
                                userDataUpdate?.email,
                              );
                              if (isValidEmail) {
                                setErrorMsg(isValidEmail);
                                return;
                              }
                              updateUserFieldsMutation.mutate(userDataUpdate);
                            }}
                          >
                            {updateUserFieldsMutation?.isPending ? (
                              <Loading />
                            ) : (
                              translations('tabs.content.tab1.ctas.update')
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-gray-900">
                        {userEmail}
                      </span>
                    )}
                  </div>

                  {!isEmailUpdating && (
                    <button
                      onClick={() => {
                        setIsEmailUpdating(true);
                        setUserDataUpdate({
                          email: profileDetails?.userDetails?.email || '',
                        });
                      }}
                      className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                </div>

                {/* Mobile Number Panel */}
                <div className="flex items-start justify-between gap-4 rounded-sm border border-gray-100 bg-[#F8F9FA] p-5">
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">
                        Mobile Number
                      </span>
                      {profileDetails?.userDetails?.user?.isAadhaarVerified && (
                        <span className="inline-flex items-center gap-1 border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          <CheckCircle2 size={10} /> Aadhaar Verified
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {userMobile}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Associations Tab Content */}
        <TabsContent value="associations">
          <div className="flex flex-col gap-3">
            {!profileDetails?.userDetails?.user?.isOnboardingCompleted ? (
              <div className="relative">
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-200/50 backdrop-blur-[1px]">
                  <Lock size={24} className="text-gray-400" />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-sm border border-gray-100 bg-[#F8F9FA] p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#288AF9]">
                      <Building2 size={20} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-gray-900">
                        Company Name
                      </span>
                      <span className="text-xs capitalize text-gray-500">
                        Private Limited Company
                      </span>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400">
                          Roles:
                        </span>
                        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          Admin
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* List of Associated Entities */
              <div className="flex flex-col gap-4">
                {isAccountsLoading ? (
                  <div className="flex justify-center p-8">
                    <Loading />
                  </div>
                ) : userAccounts && userAccounts.length > 0 ? (
                  userAccounts.map((userAccount) => {
                    const entName =
                      userAccount?.enterprise?.enterpriseName ??
                      'Enterprise Not Completed';
                    const entType =
                      userAccount?.enterprise?.type ||
                      'Private Limited Company';
                    const rolesList = userAccount?.roles || [];
                    return (
                      <div
                        key={userAccount?.userAccountId}
                        className="flex items-center justify-between gap-4 rounded-sm border border-gray-100 bg-[#F8F9FA] p-5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#288AF9]">
                            <Building2 size={20} />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-gray-900">
                              {entName}
                            </span>
                            <span className="text-xs capitalize text-gray-500">
                              {entType}
                            </span>
                            {rolesList.length > 0 && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold text-gray-400">
                                  Roles:
                                </span>
                                {rolesList.map((role, idx) => {
                                  const colorClass =
                                    roleColors[idx % roleColors.length] ||
                                    'bg-gray-500 text-white';
                                  return (
                                    <span
                                      key={role}
                                      className={cn(
                                        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold',
                                        colorClass,
                                      )}
                                    >
                                      {convertSnakeToTitleCase(role)}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No associations found.
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Additional Information Tab Content */}
        <TabsContent value="additionalInformation">
          <div className="flex flex-col gap-3">
            {!profileDetails?.userDetails?.user?.isOnboardingCompleted ? (
              <div className="relative">
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-200/50 backdrop-blur-[1px]">
                  <Lock size={24} className="text-gray-400" />
                </div>
                <Overview
                  data={{
                    doi: '01/07/2017',
                    gstNumber: 'Not Provided',
                    udyam: 'Not Provided',
                    cin: 'Not Provided',
                  }}
                  labelMap={{
                    doi: 'Date of Incorporation',
                    gstNumber: 'GST Registration',
                    udyam: 'Udyam Registration',
                    cin: 'Corporate Identification Number (CIN)',
                  }}
                  sectionClass="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 w-full"
                />
              </div>
            ) : (
              <Overview
                data={{
                  doi:
                    formatDate(profileDetails?.enterpriseDetails?.doi) ||
                    '01/07/2017',
                  gstNumber:
                    profileDetails?.enterpriseDetails?.gstNumber ||
                    'Not Provided',
                  udyam:
                    profileDetails?.enterpriseDetails?.udyam || 'Not Provided',
                  cin: profileDetails?.enterpriseDetails?.cin || 'Not Provided',
                }}
                labelMap={{
                  accountStatus: 'Account Status',
                  doi: 'Date of Incorporation',
                  gstNumber: 'GST Registration',
                  udyam: 'Udyam Registration',
                  cin: 'Corporate Identification Number (CIN)',
                }}
                customRender={{
                  accountStatus: (val) => (
                    <span className="inline-flex items-center gap-1 font-bold text-green-600">
                      <CheckCircle2 size={14} /> {val}
                    </span>
                  ),
                  gstNumber: (val) => (
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {val}
                      </span>
                      {profileDetails?.enterpriseDetails?.isGstVerified ? (
                        <span className="inline-flex items-center gap-1 border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                          Unverified
                        </span>
                      )}
                    </div>
                  ),
                  udyam: (val) => (
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {val}
                      </span>
                      {profileDetails?.enterpriseDetails?.isUdyamVerified ? (
                        <span className="inline-flex items-center gap-1 border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                          Unverified
                        </span>
                      )}
                    </div>
                  ),
                  cin: (val) => (
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {val}
                      </span>
                      {profileDetails?.enterpriseDetails?.isCinVerified ? (
                        <span className="inline-flex items-center gap-1 border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                          Unverified
                        </span>
                      )}
                    </div>
                  ),
                }}
                sectionClass="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 w-full"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Wrapper>
  );
}

export default Profile;
