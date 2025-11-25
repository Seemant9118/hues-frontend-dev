'use client';

import { addressAPIs } from '@/api/addressApi/addressApis';
import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { tokenApi } from '@/api/tokenApi/tokenApi';
import { apiErrorHandler } from '@/appUtils/apiErrorHandler';
import {
  validateDateOfIncorporation,
  validateEnterpriseAddress,
  validateEnterpriseName,
  validatePinCode,
} from '@/appUtils/ValidationUtils';
import ExplantoryText from '@/components/auth/ExplantoryText';
import Tooltips from '@/components/auth/Tooltips';
import { Button } from '@/components/ui/button';
import DatePickers from '@/components/ui/DatePickers';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { getDataFromPinCode } from '@/services/address_Services/AddressServices';
import {
  getEnterpriseById,
  UpdateEnterprise,
} from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { refreshToken } from '@/services/Token_Services/TokenServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const EnterpriseVerificationDetailsPage = () => {
  const translations = useTranslations(
    'auth.enterprise.enterpriseVerification',
  );
  const translationsAPIErrors = useTranslations('auth.apiErrorsOnboarding');
  const translationForError = useTranslations();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const queryClient = useQueryClient();
  const router = useRouter();
  const inputRefs = useRef({});
  const [enterpriseOnboardData, setEnterpriseOnboardData] = React.useState({
    name: '',
    email: '',
    pincode: '',
    city: '',
    state: '',
    address: '',
    roc: '',
    doi: '',
    type: '',
    panNumber: '',
    CIN: '',
  });
  const [errorMsg, setErrorMsg] = React.useState(null);

  const sanitizeAddress = (address, city, state, pincode) => {
    if (!address) return '';

    let clean = address;

    // Normalize for comparison
    const normalizedCity = city?.trim().toLowerCase();
    const normalizedState = state?.trim().toLowerCase();

    // Remove pincode like "- 400701" or "400701"
    if (pincode) {
      const pinRegex = new RegExp(`[-,\\s]*${pincode}\\b`, 'i');
      clean = clean?.replace(pinRegex, '');
    }

    // Remove exact city anywhere (case insensitive)
    if (city) {
      const cityRegex = new RegExp(
        `\\b${normalizedCity.replace(/ /g, '\\s+')}\\b`,
        'i',
      );
      clean = clean?.replace(cityRegex, '');
    }

    // Remove exact state
    if (state) {
      const stateRegex = new RegExp(
        `\\b${normalizedState.replace(/ /g, '\\s+')}\\b`,
        'i',
      );
      clean = clean?.replace(stateRegex, '');
    }

    // Remove country INDIA (if present)
    clean = clean?.replace(/\bindia\b/i, '');

    // Remove duplicated commas, spaces, hyphens
    clean = clean?.replace(/,+/g, ','); // multiple commas → single
    clean = clean?.replace(/\s{2,}/g, ' '); // extra spaces → single
    clean = clean?.replace(/,\s*,/g, ','); // ",  ,"
    clean = clean?.replace(/-\s*,/g, ','); // "- ,"

    // Remove trailing comma or hyphen
    clean = clean?.replace(/^[,\-\s]+|[,\-\s]+$/g, '');

    return clean?.trim();
  };
  // fetch details
  const { data: enterpriseData } = useQuery({
    queryKey: [enterpriseUser.getEnterprise.endpointKey, enterpriseId],
    queryFn: () => getEnterpriseById(enterpriseId),
    enabled: !!enterpriseId,
    select: (data) => data?.data?.data,
    retry: (failureCount, error) => {
      return error.response.status === 401 || error.response.status === 403;
    },
  });

  // setDetails
  useEffect(() => {
    if (enterpriseData) {
      const sanitizedAddress = sanitizeAddress(
        enterpriseData?.addresses[0]?.address || '',
        enterpriseData?.addresses[0]?.city || '',
        enterpriseData?.addresses[0]?.state || '',
        enterpriseData?.addresses[0]?.pincode || '',
      );

      setEnterpriseOnboardData((prev) => ({
        ...prev,
        name: enterpriseData?.name || '',
        email: enterpriseData?.email || '',
        pincode: enterpriseData?.addresses[0]?.pincode || '',
        city: '',
        state: '',
        address: sanitizedAddress,
        roc: enterpriseData?.roc || '',
        doi: enterpriseData?.doi || '',
        type: enterpriseData?.type || '',
        panNumber: enterpriseData?.panNumber || '',
        CIN: enterpriseData?.cin || '',
      }));
    }
  }, [enterpriseData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'pincode') {
      if (enterpriseOnboardData?.pincode?.length !== 5) {
        setEnterpriseOnboardData((prev) => ({
          ...prev,
          city: '',
          state: '',
        }));
      }
    }
    setEnterpriseOnboardData((values) => ({ ...values, [name]: value }));

    setErrorMsg((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleDateChange = (date) => {
    if (!date) {
      setEnterpriseOnboardData((prev) => ({
        ...prev,
        doi: '',
      }));
      return;
    }

    // Convert to local date string (YYYY-MM-DD)
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000)
      .toISOString()
      .split('T')[0];

    setEnterpriseOnboardData((prev) => ({
      ...prev,
      doi: localDate,
    }));

    setErrorMsg((prev) => ({
      ...prev,
      doi: '',
    }));
  };

  const {
    data: addressData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      addressAPIs.getAddressFromPincode.endpointKey,
      enterpriseOnboardData?.pincode,
    ],
    enabled: enterpriseOnboardData?.pincode?.length === 6,
    queryFn: async () => {
      try {
        const res = await getDataFromPinCode(enterpriseOnboardData?.pincode);
        return res?.data?.data;
      } catch (err) {
        const customError = apiErrorHandler(err);
        if (err?.response?.status === 400) {
          setErrorMsg((prev) => ({
            ...prev,
            pincode: translationsAPIErrors(customError),
          }));
          setEnterpriseOnboardData((prev) => ({
            ...prev,
            city: '',
            state: '',
          }));
        } else {
          toast.error(translationsAPIErrors(customError));
        }
        throw err; // rethrow so React Query knows it failed
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (addressData) {
      setEnterpriseOnboardData((prev) => ({
        ...prev,
        city: addressData.district || '',
        state: addressData.state || '',
      }));
    }
  }, [addressData]);

  const validation = (enterpriseOnboardD) => {
    const errors = {};
    errors.name = validateEnterpriseName(enterpriseOnboardD.name);
    errors.pincode = validatePinCode(enterpriseOnboardD.pincode);
    errors.address = validateEnterpriseAddress(enterpriseOnboardD.address);
    errors.doi = validateDateOfIncorporation(enterpriseOnboardD.doi);

    // Remove empty error messages
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });

    return errors;
  };

  // mutation fn : update enterprise
  const enterpriseOnboardUpdateMutation = useMutation({
    mutationFn: UpdateEnterprise,
    onSuccess: async (data) => {
      // refreshToken
      const refreshTokenValue = await queryClient.fetchQuery({
        queryKey: [tokenApi.refreshToken.endpointKey],
        queryFn: refreshToken,
      });
      // set new access token
      const newAccessToken = refreshTokenValue?.data?.data?.access_token;
      LocalStorageService.set('token', newAccessToken);
      const { id, isOnboardingCompleted, isEnterpriseOnboardingComplete } =
        data.data.data;

      LocalStorageService.set('isOnboardingComplete', isOnboardingCompleted);
      LocalStorageService.set('enterprise_Id', id);
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        isEnterpriseOnboardingComplete,
      );

      // clear original data which was used in onboarding
      LocalStorageService.remove('companyData');
      LocalStorageService.remove('gst');

      toast.success(translations('toast.success'));

      router.push('/login/enterprise/enterprise-onboarded-success');
    },
    onError: (error) => {
      const customError = apiErrorHandler(error);
      toast.error(translationsAPIErrors(customError));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const isError = validation(enterpriseOnboardData) || {}; // Ensure it's always an object

    if (Object.keys(isError).length === 0) {
      setErrorMsg(null);
      enterpriseOnboardUpdateMutation.mutate({
        id: enterpriseId,
        data: enterpriseOnboardData,
      });
    } else {
      setErrorMsg(isError);

      // Scroll to first error field
      const firstErrorKey = Object.keys(isError)[0];
      const firstErrorElement = inputRefs.current[firstErrorKey];
      if (firstErrorElement?.scrollIntoView) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        firstErrorElement.focus?.();
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex h-full items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-[500px] flex-col items-center gap-2"
      >
        <div className="mb-2 flex flex-col gap-1">
          <h1 className="w-full text-center text-xl font-bold text-[#121212]">
            {translations('heading')}
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            {translations('subheading')}
          </p>
        </div>

        <div className="navScrollBarStyles flex max-h-[400px] w-full flex-col gap-5 overflow-y-auto">
          <div
            ref={(el) => {
              inputRefs.current.name = el;
            }}
            className="grid w-full items-center gap-1 px-2"
          >
            <Label
              htmlFor="enterpriseName"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              {translations('labels.enterpriseName')}{' '}
              <span className="text-red-600">*</span>{' '}
              <Tooltips
                trigger={<Info size={12} />}
                content={translations('labels.enterpriseName')}
              />
            </Label>

            <div className="relative">
              <Input
                className="focus:font-bold"
                type="text"
                placeholder={translations('placeholders.enterpriseName')}
                name="name"
                value={enterpriseOnboardData.name}
                onChange={handleChange}
              />
            </div>
            {errorMsg?.name && (
              <ErrorBox msg={translationForError(errorMsg.name)} />
            )}
          </div>
          <div className="grid w-full items-center gap-1 px-2">
            <Label
              htmlFor="email"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              {translations('labels.email')}
              <Tooltips
                trigger={<Info size={12} />}
                content={translations('labels.email')}
              />
            </Label>

            <div className="relative">
              <Input
                className="focus:font-bold"
                type="text"
                placeholder="enterprise@gmail.com"
                name="email"
                value={enterpriseOnboardData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-2">
            <div
              ref={(el) => {
                inputRefs.current.pincode = el;
              }}
              className="flex flex-col gap-1"
            >
              <Label htmlFor="pincode">
                {translations('labels.pincode')}{' '}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  id="pincode"
                  name="pincode"
                  className="pr-10"
                  value={enterpriseOnboardData?.pincode}
                  onChange={handleChange}
                  placeholder={translations('placeholders.pincode')}
                />
                {(isLoading || isFetching) && (
                  <div className="absolute right-1 top-2 text-gray-500">
                    <Loading />
                  </div>
                )}
              </div>
              {errorMsg?.pincode && (
                <ErrorBox msg={translationForError(errorMsg?.pincode)} />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="city">{translations('labels.city')}</Label>
              <Input
                id="city"
                name="city"
                disabled
                value={enterpriseOnboardData?.city}
                placeholder={translations('placeholders.city')}
              />
            </div>
          </div>

          <div className="space-y-1 px-2">
            <Label htmlFor="state">{translations('labels.state')}</Label>
            <Input
              id="state"
              name="state"
              value={enterpriseOnboardData?.state}
              disabled
              placeholder={translations('placeholders.state')}
            />
          </div>

          <div
            ref={(el) => {
              inputRefs.current.address = el;
            }}
            className="grid w-full items-center gap-1 px-2"
          >
            <Label
              htmlFor="address"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              {translations('labels.address')}{' '}
              <span className="text-red-600">*</span>{' '}
              <Tooltips
                trigger={<Info size={12} />}
                content={translations('labels.address')}
              />
            </Label>

            <div className="relative">
              <Input
                className="focus:font-bold"
                type="text"
                placeholder={translations('placeholders.address')}
                name="address"
                value={enterpriseOnboardData.address}
                onChange={handleChange}
              />
              {errorMsg?.address && (
                <ErrorBox msg={translationForError(errorMsg.address)} />
              )}
            </div>
          </div>

          <div className="grid w-full items-center gap-1 px-2">
            <Label
              htmlFor="roc"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              {translations('labels.roc')}
              <Tooltips
                trigger={<Info size={12} />}
                content={translations('placeholders.roc')}
              />
            </Label>

            <div className="relative">
              <Input
                className="focus:font-bold"
                type="text"
                placeholder={translations('labels.roc')}
                name="roc"
                value={enterpriseOnboardData.roc}
                onChange={handleChange}
              />
            </div>
          </div>

          <div
            ref={(el) => {
              inputRefs.current.doi = el;
            }}
            className="grid w-full items-center gap-1 px-2"
          >
            <Label
              htmlFor="doi"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              {translations('labels.doi')}{' '}
              <span className="text-red-600">*</span>{' '}
              <Tooltips
                trigger={<Info size={12} />}
                content={translations('placeholders.doi')}
              />
            </Label>

            <div className="relative">
              {enterpriseData?.doi ? (
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder={translations('placeholders.doi')}
                  name="doi"
                  value={enterpriseOnboardData.doi}
                  disabled
                />
              ) : (
                <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <DatePickers
                    name="doi"
                    selected={
                      enterpriseOnboardData.doi
                        ? new Date(enterpriseOnboardData.doi)
                        : null
                    }
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    popperPlacement="bottom-end"
                  />
                </div>
              )}
            </div>
            {errorMsg?.doi && (
              <ErrorBox msg={translationForError(errorMsg.doi)} />
            )}
          </div>
        </div>
        <div className="flex w-full flex-col gap-4">
          {/* Explanatory Information */}
          <ExplantoryText text={translations('information')} />

          <Button
            size="sm"
            type="submit"
            className="w-full"
            disabled={enterpriseOnboardUpdateMutation.isPending}
          >
            {enterpriseOnboardUpdateMutation.isPending ? (
              <Loading />
            ) : (
              translations('buttons.proceed')
            )}
          </Button>

          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft size={14} />
            {translations('buttons.back')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnterpriseVerificationDetailsPage;
