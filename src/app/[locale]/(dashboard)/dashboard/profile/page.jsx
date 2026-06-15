'use client';

import { userAuth } from '@/api/user_auth/Users';
import { validateEmail } from '@/appUtils/ValidationUtils';
import {
  capitalize,
  convertSnakeToTitleCase,
  roleColors,
} from '@/appUtils/helperFunctions';
import ErrorBox from '@/components/ui/ErrorBox';
import Loading from '@/components/ui/Loading';
import Overview from '@/components/ui/Overview';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { cn, LocalStorageService, SessionStorageService } from '@/lib/utils';
import {
  getProfileDetails,
  getUserAccounts,
  LoggingOut,
  userUpdateFields,
  patchUserUpdate,
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
  Plus,
  Trash2,
  GraduationCap,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const SUPPORTED_LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi (हिन्दी)' },
  { value: 'bengali', label: 'Bengali (বাংলা)' },
  { value: 'telugu', label: 'Telugu (తెలుగు)' },
  { value: 'marathi', label: 'Marathi (मराठी)' },
  { value: 'tamil', label: 'Tamil (தமிழ்)' },
  { value: 'gujarati', label: 'Gujarati (ગુજરાતી)' },
  { value: 'kannada', label: 'Kannada (കನ್ನಡ)' },
  { value: 'odia', label: 'Odia (ଓଡ଼ିଆ)' },
  { value: 'malayalam', label: 'Malayalam (മലയാളം)' },
  { value: 'punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { value: 'assamese', label: 'Assamese (অসমীয়া)' },
  { value: 'maithili', label: 'Maithili (मैथिली)' },
  { value: 'sanskrit', label: 'Sanskrit (संस्कृतम्)' },
  { value: 'urdu', label: 'Urdu (اُردُو)' },
];

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

  // Languages CRUD State
  const [selectedLang, setSelectedLang] = useState('');

  // Qualifications CRUD State
  const [isQualModalOpen, setIsQualModalOpen] = useState(false);
  const [qualFormData, setQualFormData] = useState({
    degree: '',
    field: '',
    institution: '',
    year: '',
  });
  const [editQualIndex, setEditQualIndex] = useState(null);
  const [qualErrors, setQualErrors] = useState({});

  // Interests CRUD State
  const [interestInput, setInterestInput] = useState('');

  // PATCH user metadata mutation
  const patchUserMetadataMutation = useMutation({
    mutationFn: (payload) => patchUserUpdate(payload),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries([userAuth.getProfileDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to update profile details',
      );
    },
  });

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

  // Extract user metadata arrays
  const userMetadata =
    profileDetails?.userDetails?.user?.metadata ||
    profileDetails?.userDetails?.user?.metaData ||
    {};
  const knownLanguages =
    profileDetails?.userDetails?.user?.knownLanguages ||
    userMetadata?.knownLanguages ||
    [];
  const qualifications =
    profileDetails?.userDetails?.user?.qualifications ||
    userMetadata?.qualifications ||
    [];
  const interests =
    profileDetails?.userDetails?.user?.interests ||
    userMetadata?.interests ||
    [];

  // Languages handlers
  const handleAddLanguage = () => {
    if (!selectedLang) return;
    if (
      knownLanguages.some((l) => l.toLowerCase() === selectedLang.toLowerCase())
    ) {
      toast.error('Language already added');
      return;
    }
    const updated = [...knownLanguages, selectedLang];
    patchUserMetadataMutation.mutate({ knownLanguages: updated });
    setSelectedLang('');
  };

  const handleDeleteLanguage = (langToDelete) => {
    const updated = knownLanguages.filter(
      (l) => l.toLowerCase() !== langToDelete.toLowerCase(),
    );
    patchUserMetadataMutation.mutate({ knownLanguages: updated });
  };

  // Qualifications handlers
  const handleOpenAddQual = () => {
    setQualFormData({ degree: '', field: '', institution: '', year: '' });
    setEditQualIndex(null);
    setQualErrors({});
    setIsQualModalOpen(true);
  };

  const handleOpenEditQual = (index) => {
    const item = qualifications[index];
    setQualFormData({
      degree: item.degree || '',
      field: item.field || '',
      institution: item.institution || '',
      year: item.year || '',
    });
    setEditQualIndex(index);
    setQualErrors({});
    setIsQualModalOpen(true);
  };

  const handleQualChange = (e) => {
    const { name, value } = e.target;
    setQualFormData((prev) => ({ ...prev, [name]: value }));
    setQualErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleQualSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!qualFormData.degree.trim()) newErrors.degree = 'Degree is required';
    if (!qualFormData.institution.trim())
      newErrors.institution = 'Institution is required';
    if (!qualFormData.year.toString().trim()) {
      newErrors.year = 'Year is required';
    } else if (Number.isNaN(Number(qualFormData.year))) {
      newErrors.year = 'Year must be a valid number';
    }

    if (Object.keys(newErrors).length > 0) {
      setQualErrors(newErrors);
      return;
    }

    const newQual = {
      degree: qualFormData.degree.trim(),
      field: qualFormData.field.trim(),
      institution: qualFormData.institution.trim(),
      year: Number(qualFormData.year),
    };

    let updated = [];
    if (editQualIndex !== null) {
      updated = qualifications.map((q, idx) =>
        idx === editQualIndex ? newQual : q,
      );
    } else {
      updated = [...qualifications, newQual];
    }

    patchUserMetadataMutation.mutate({ qualifications: updated });
    setIsQualModalOpen(false);
  };

  const handleDeleteQual = (index) => {
    const updated = qualifications.filter((_, idx) => idx !== index);
    patchUserMetadataMutation.mutate({ qualifications: updated });
  };

  // Interests handlers
  const handleAddInterest = (e) => {
    e.preventDefault();
    if (!interestInput.trim()) return;
    const cleanInterest = interestInput.trim().toLowerCase();
    if (interests.some((i) => i.toLowerCase() === cleanInterest)) {
      toast.error('Interest already added');
      return;
    }
    const updated = [...interests, interestInput.trim()];
    patchUserMetadataMutation.mutate({ interests: updated });
    setInterestInput('');
  };

  const handleDeleteInterest = (interestToDelete) => {
    const updated = interests.filter(
      (i) => i.toLowerCase() !== interestToDelete.toLowerCase(),
    );
    patchUserMetadataMutation.mutate({ interests: updated });
  };

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
          variant="blue_outline"
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
                  entities: 'Entity',
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
              <div className="pointer-events-none flex flex-col gap-6 rounded-sm border border-gray-100 bg-[#F8F9FA] p-6 opacity-60">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Known Languages
                  </h3>
                  <p className="text-xs text-gray-500">
                    Manage the languages you can speak, read, or write
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      disabled
                      className="h-9 w-full max-w-xs rounded-md border border-gray-200 bg-white px-3 py-1 text-sm"
                    >
                      <option value="">Select a language</option>
                    </select>
                    <Button disabled size="sm">
                      <Plus size={14} className="mr-1" /> Add Language
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 rounded-sm border border-gray-100 bg-[#F8F9FA] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Known Languages
                  </h3>
                  <p className="text-xs text-gray-500">
                    Manage the languages you can speak, read, or write
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="h-9 w-full max-w-xs rounded-md border border-gray-200 bg-white px-3 py-1 text-sm focus:border-[#288AF9] focus:outline-none focus:ring-2 focus:ring-[#288AF9]/20"
                  >
                    <option value="">Select a language</option>
                    {SUPPORTED_LANGUAGES.filter(
                      (lang) =>
                        !knownLanguages.some(
                          (kl) => kl.toLowerCase() === lang.value.toLowerCase(),
                        ),
                    ).map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>

                  <Button
                    size="sm"
                    onClick={handleAddLanguage}
                    disabled={
                      !selectedLang || patchUserMetadataMutation.isPending
                    }
                    className="bg-[#288AF9] text-white hover:bg-[#288AF9]/90"
                  >
                    <Plus size={14} className="mr-1" /> Add Language
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  {knownLanguages.length > 0 ? (
                    knownLanguages.map((lang) => {
                      const matched = SUPPORTED_LANGUAGES.find(
                        (l) => l.value.toLowerCase() === lang.toLowerCase(),
                      );
                      const label = matched
                        ? matched.label
                        : lang.charAt(0).toUpperCase() + lang.slice(1);
                      return (
                        <span
                          key={lang}
                          className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100"
                        >
                          {label}
                          <button
                            type="button"
                            onClick={() => handleDeleteLanguage(lang)}
                            disabled={patchUserMetadataMutation.isPending}
                            className="rounded-full p-0.5 text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })
                  ) : (
                    <div className="w-full rounded-lg border border-dashed border-gray-200 bg-white py-6 text-center">
                      <p className="text-sm text-gray-500">
                        No known languages added yet. Add one from the dropdown
                        above.
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
                        {profileDetails?.userDetails?.user?.dateOfBirth || '-'}
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
                        {profileDetails?.userDetails?.user?.maskedAadhaar ||
                          '-'}
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
          {!profileDetails?.userDetails?.user?.isOnboardingCompleted ? (
            <div className="relative">
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-200/50 backdrop-blur-[1px]">
                <Lock size={24} className="text-gray-400" />
              </div>
              <div className="pointer-events-none flex flex-col gap-6 opacity-60">
                {/* Qualifications Card (Disabled) */}
                <div className="flex flex-col gap-4 rounded-sm border border-gray-100 bg-[#F8F9FA] p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="text-[#288AF9]" size={20} />
                      <h3 className="text-base font-bold text-gray-900">
                        Qualifications
                      </h3>
                    </div>
                    <Button disabled size="sm" variant="outline">
                      <Plus size={14} className="mr-1" /> Add Qualification
                    </Button>
                  </div>
                  <div className="rounded-sm border border-dashed border-gray-200 bg-white py-8 text-center">
                    <p className="text-sm text-gray-500">
                      No qualifications added yet.
                    </p>
                  </div>
                </div>

                {/* Interests Card (Disabled) */}
                <div className="flex flex-col gap-4 rounded-sm border border-gray-100 bg-[#F8F9FA] p-6">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#288AF9]">
                      &hearts;
                    </span>
                    <h3 className="text-base font-bold text-gray-900">
                      Interests
                    </h3>
                  </div>
                  <div className="rounded-sm border border-dashed border-gray-200 bg-white py-8 text-center">
                    <p className="text-sm text-gray-500">
                      No interests added yet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Qualifications Card */}
              <div className="flex flex-col gap-4 rounded-sm border border-gray-100 bg-[#F8F9FA] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="text-[#288AF9]" size={20} />
                    <h3 className="text-base font-bold text-gray-900">
                      Qualifications
                    </h3>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOpenAddQual}
                    className="border-[#288AF9] text-[#288AF9] hover:bg-[#288AF9] hover:text-white"
                  >
                    <Plus size={14} className="mr-1" /> Add Qualification
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {qualifications.length > 0 ? (
                    qualifications.map((qual, idx) => (
                      <div
                        key={`${qual.degree}-${qual.field || ''}-${qual.institution}-${qual.year}`}
                        className="flex items-center justify-between rounded-sm border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600">
                            <GraduationCap size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {qual.degree}
                              {qual.field ? ` in ${qual.field}` : ''}
                            </span>
                            <span className="text-xs text-gray-500">
                              {qual.institution} &bull; {qual.year}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditQual(idx)}
                            className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQual(idx)}
                            className="p-2 text-red-400 transition-colors hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-sm border border-dashed border-gray-200 bg-white py-8 text-center">
                      <p className="text-sm text-gray-500">
                        No qualifications added yet. Add your qualifications.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Interests Card */}
              <div className="flex flex-col gap-4 rounded-sm border border-gray-100 bg-[#F8F9FA] p-6">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#288AF9]">
                    &hearts;
                  </span>
                  <h3 className="text-base font-bold text-gray-900">
                    Interests
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Tag List */}
                  <div className="flex flex-wrap gap-2.5">
                    {interests.length > 0 ? (
                      interests.map((int) => (
                        <span
                          key={int}
                          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50"
                        >
                          {int}
                          <button
                            type="button"
                            onClick={() => handleDeleteInterest(int)}
                            className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 focus:outline-none"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <div className="w-full rounded-lg border border-dashed border-gray-200 bg-white py-6 text-center">
                        <p className="text-sm text-gray-500">
                          No interests added yet. Type below to add one.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Add Input */}
                  <form
                    onSubmit={handleAddInterest}
                    className="flex items-center gap-3"
                  >
                    <Input
                      type="text"
                      placeholder="Add an interest"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      className="h-9 max-w-xs bg-white text-xs"
                    />
                    <Button
                      type="submit"
                      disabled={
                        !interestInput.trim() ||
                        patchUserMetadataMutation.isPending
                      }
                      size="sm"
                      className="bg-[#288AF9] text-white hover:bg-[#288AF9]/90"
                    >
                      <Plus size={14} className="mr-1" /> Add
                    </Button>
                  </form>
                </div>
              </div>

              {/* Add/Edit Qualification Modal */}
              <Dialog open={isQualModalOpen} onOpenChange={setIsQualModalOpen}>
                <DialogContent className="max-w-md">
                  <DialogTitle>
                    {editQualIndex !== null
                      ? 'Edit Qualification'
                      : 'Add Qualification'}
                  </DialogTitle>
                  <form onSubmit={handleQualSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <Label htmlFor="degree">
                        Title / Degree <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="degree"
                        name="degree"
                        value={qualFormData.degree}
                        onChange={handleQualChange}
                        placeholder="e.g., Bachelor of Commerce"
                      />
                      {qualErrors.degree && (
                        <ErrorBox msg={qualErrors.degree} />
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="field">Field of Study</Label>
                      <Input
                        id="field"
                        name="field"
                        value={qualFormData.field}
                        onChange={handleQualChange}
                        placeholder="e.g., Computer Science"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="institution">
                        Institution <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="institution"
                        name="institution"
                        value={qualFormData.institution}
                        onChange={handleQualChange}
                        placeholder="e.g., Mumbai University"
                      />
                      {qualErrors.institution && (
                        <ErrorBox msg={qualErrors.institution} />
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="year">
                        Year <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="year"
                        name="year"
                        type="text"
                        value={qualFormData.year}
                        onChange={handleQualChange}
                        placeholder="e.g., 2020"
                      />
                      {qualErrors.year && <ErrorBox msg={qualErrors.year} />}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsQualModalOpen(false)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-[#288AF9] text-white hover:bg-[#288AF9]/90"
                        disabled={patchUserMetadataMutation.isPending}
                      >
                        {patchUserMetadataMutation.isPending ? (
                          <Loading />
                        ) : editQualIndex !== null ? (
                          'Save Changes'
                        ) : (
                          'Add Qualification'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Wrapper>
  );
}

export default Profile;
