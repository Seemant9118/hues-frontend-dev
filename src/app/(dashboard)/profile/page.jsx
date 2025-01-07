'use client';

import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { userAuth } from '@/api/user_auth/Users';
import { getInitialsNames, getRandomBgColor } from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { updateEnterpriseIdentificationDetails } from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import {
  getProfileDetails,
  LoggingOut,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Info, Pencil, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function Profile() {
  const queryClient = useQueryClient();
  const userId = LocalStorageService.get('user_profile');

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
      userId,
    ],
    mutationFn: () =>
      updateEnterpriseIdentificationDetails(
        userId,
        updateEnterpriseDetails?.identifierType,
        updateEnterpriseDetails?.identifierNum,
      ),
    onSuccess: () => {
      toast.success('Enterprise Details Updated Successfully');
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
    onError: (error) => {
      if (error.response.data.message === 'Internal Error') {
        toast.error(`Invalid ${updateEnterpriseDetails?.identifierType}`);
      } else {
        toast.error(error.response.data.message || 'Something went wrong');
      }
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
      toast.success(res.data.message || 'User Logged Out');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
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
  });

  useEffect(() => {
    const bgColorClass = getRandomBgColor();
    setBgColor(bgColorClass);
  }, []);

  return (
    <Wrapper className="h-full gap-8">
      <SubHeader name="Profile">
        <Button size="sm" variant="blue_outline" onClick={logout}>
          Logout
        </Button>
      </SubHeader>

      <Tabs
        className="flex flex-col gap-4"
        value={tab}
        onValueChange={onTabChange}
        defaultValue={'userOverview'}
      >
        <TabsList className="w-fit border">
          <TabsTrigger value="userOverview">Overview</TabsTrigger>
          <TabsTrigger value="enterpriseOverview">
            Enterprise Overview
          </TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* ---checks : for if user skips */}

        {/* if user is not onboard */}
        {!profileDetails?.userDetails?.user?.isOnboardingCompleted && (
          <div className="flex items-center justify-between rounded-md bg-[#288AF90A] p-2">
            <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
              <Info size={14} />
              {` Your onboarding is not complete yet, please complete it to unlock additional features.`}
            </span>
            <Button
              size="sm"
              className="h-8 bg-[#288AF9]"
              onClick={() => {
                router.push('/login/userOnboarding');
              }}
            >
              Complete
            </Button>
          </div>
        )}
        {/* if user onboarded but enterprise is not created */}
        {profileDetails?.userDetails?.user?.isOnboardingCompleted &&
          !profileDetails?.userDetails?.enterpriseId && (
            <div className="flex items-center justify-between rounded-md bg-[#288AF90A] p-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                <Info size={14} />
                {` You have not created enterprise yet, please create your enterprise to unlock additional features.`}
              </span>
              <Button
                size="sm"
                className="h-8 bg-[#288AF9]"
                onClick={() => {
                  router.push('/login/enterpriseOnboardingSearch');
                }}
              >
                Complete
              </Button>
            </div>
          )}

        {/* if user onboarded and enterprise created and enterpriseType is properietorship but enterpriseOnboarding or kyc verification not completed yet */}
        {profileDetails?.userDetails?.user?.isOnboardingCompleted &&
          profileDetails?.userDetails?.enterpriseId &&
          profileDetails?.enterpriseDetails?.type === 'proprietorship' &&
          (!profileDetails?.enterpriseDetails?.isOnboardingCompleted ||
            !profileDetails?.userDetails?.user?.isKycVerified) && (
            <div className="flex items-center justify-between rounded-md bg-[#288AF90A] p-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                <Info size={14} />
                {` Your KYC process is still pending. Please click the 'Start KYC' button to complete the verification and unlock additional features.`}
              </span>
              <Button
                size="sm"
                className="h-8 bg-[#288AF9]"
                onClick={() => {
                  router.push('/login/kyc');
                }}
              >
                Start Kyc
              </Button>
            </div>
          )}

        {/* if user onboarded and enterprise created and enterpriseType is pvtltd/llp/publicltd etc but enterpriseOnboarding not completed yet */}
        {profileDetails?.userDetails?.user?.isOnboardingCompleted &&
          profileDetails?.userDetails?.enterpriseId &&
          profileDetails?.enterpriseDetails?.type !== 'proprietorship' &&
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
                  router.push('/login/isDirector');
                }}
              >
                Complete
              </Button>
            </div>
          )}

        {/* if user onboarded and enterprise created and enterpriseType is pvtltd/llp/publicltd etc and enterpriseOnboarding completed but kyc not verified yet */}
        {profileDetails?.userDetails?.user?.isOnboardingCompleted &&
          profileDetails?.userDetails?.enterpriseId &&
          profileDetails?.enterpriseDetails?.type !== 'proprietorship' &&
          profileDetails?.enterpriseDetails?.isOnboardingCompleted &&
          !profileDetails?.userDetails?.user?.isKycVerified && (
            <div className="flex items-center justify-between rounded-md bg-[#288AF90A] p-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                <Info size={14} />
                {` Your KYC process is still pending. Please click the 'Start KYC' button to complete the verification and unlock additional features.`}
              </span>
              <Button
                size="sm"
                className="h-8 bg-[#288AF9]"
                onClick={() => {
                  router.push('/login/kyc');
                }}
              >
                Complete
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
                  <Label className="text-xs">PAN Card Number</Label>
                  <span className="text-lg font-bold">{'XXXXXX1234'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Full Name</Label>
                  <span className="text-lg font-bold">{'Your Full Name'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Type</Label>
                  <span className="text-lg font-bold">{'Individual'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Mobile Number</Label>
                  <span className="text-lg font-bold">+91 {'9876543210'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Email Address</Label>
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
                    <span className="text-sm font-bold">Profile Picture</span>
                    <span className="text-xs text-grey">
                      JPEG and PNG format
                    </span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-end gap-2">
                  <Tooltips
                    trigger={
                      <Button size="sm" variant="blue_outline" disabled>
                        Upload
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />

                  <Tooltips
                    trigger={
                      <Button size="sm" variant="outline" disabled>
                        Delete
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 grid-rows-2 gap-8 rounded-sm border p-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">PAN Card Number</Label>
                  <span className="text-lg font-bold">
                    {profileDetails?.userDetails?.user?.panNumber}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Full Name</Label>
                  <span className="text-lg font-bold">
                    {profileDetails?.userDetails?.user?.name}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Type</Label>
                  <span className="text-lg font-bold">{'Individual'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Mobile Number</Label>
                  <span className="text-lg font-bold">
                    +91 {profileDetails?.userDetails?.user?.mobileNumber}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Email Address</Label>
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
                  <Label className="text-xs">PAN Card Number</Label>
                  <span className="text-lg font-bold">{'XXXXXX1234'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Full Name</Label>
                  <span className="text-lg font-bold">
                    {'Your Enterprise Name'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Type</Label>
                  <span className="text-lg font-bold">{'pvt. ltd.'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Mobile Number</Label>
                  <span className="text-lg font-bold">+91 {'9876543210'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Email Address</Label>
                  <span className="text-lg font-bold">
                    {'yourenterprise@gmail.com'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">GST IN</Label>
                  <span className="text-lg font-bold">{'XXXXXXXXXXXX'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">UDYAM</Label>
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
                    <span className="text-sm font-bold">Enterprise Logo</span>
                    <span className="text-xs text-grey">
                      JPEG and PNG format
                    </span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-end gap-2">
                  <Tooltips
                    trigger={
                      <Button size="sm" variant="blue_outline" disabled>
                        Upload
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />

                  <Tooltips
                    trigger={
                      <Button size="sm" variant="outline" disabled>
                        Delete
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-sm border p-4">
                <h1>Enterprise Information</h1>

                <div className="grid grid-cols-3 grid-rows-2 gap-8 p-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Full Name</Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.name ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Type</Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.type ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Mobile Number</Label>
                    <span className="text-lg font-bold">
                      +91{' '}
                      {profileDetails?.enterpriseDetails?.mobileNumber ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Email Address</Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.email ?? '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-sm border p-4">
                <h1>Business Identification</h1>

                <div className="grid grid-cols-3 grid-rows-1 gap-8 p-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">PAN Card Number</Label>
                    <span className="text-lg font-bold">
                      {profileDetails?.enterpriseDetails?.panNumber ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex w-full items-center gap-1">
                      <Label className="text-xs">GST IN</Label>

                      {!profileDetails?.enterpriseDetails?.gst &&
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
                          placeholder="Update GST IN"
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
                      <Label className="text-xs">UDYAM</Label>
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
                          placeholder="Update UDYAM"
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
                      {' '}
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        updateEnterpriseMutation.mutate();
                      }}
                    >
                      {' '}
                      Update
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="permissions">Coming Soon...</TabsContent>
      </Tabs>
    </Wrapper>
  );
}

export default Profile;
