'use client';

import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { tokenApi } from '@/api/tokenApi/tokenApi';
import Tooltips from '@/components/auth/Tooltips';
import DatePickers from '@/components/ui/DatePickers';
import ErrorBox from '@/components/ui/ErrorBox';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalStorageService } from '@/lib/utils';
import {
  CreateEnterprise,
  UpdateEnterprise,
} from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { refreshToken } from '@/services/Token_Services/TokenServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Info } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const EnterpriseDetailsSecond = ({
  setEnterpriseDetailsCurrStep,
  enterpriseOnboardData,
  setEnterpriseOnboardData,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const enterpriseIdByDirectorInvite = LocalStorageService.get(
    'enterpriseIdByDirectorInvite',
  );
  const isKycVerified = LocalStorageService.get('isKycVerified');
  const isDirector = LocalStorageService.get('isDirector');
  const [selectedDate, setSelectedDate] = useState(
    enterpriseOnboardData?.doi
      ? moment(enterpriseOnboardData.doi, 'DD/MM/YYYY').toDate()
      : null,
  );
  const [errorMsg, setErrorMsg] = useState({});

  useEffect(() => {
    if (selectedDate) {
      setEnterpriseOnboardData((prevUserData) => ({
        ...prevUserData,
        doi: moment(selectedDate).format('DD/MM/YYYY'),
      }));
    }
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date); // Update the selected date
  };

  // mutationFn : create enterprise
  const enterpriseOnboardCreateMutation = useMutation({
    mutationKey: [enterpriseUser.createEnterprise.endpointKey],
    mutationFn: CreateEnterprise,
    onSuccess: async (data) => {
      // refreshToken
      const refreshTokenValue = await queryClient.fetchQuery({
        queryKey: [tokenApi.refreshToken.endpointKey],
        queryFn: refreshToken,
      });
      // set new access token
      const newAccessToken = refreshTokenValue?.data?.data?.access_token;
      LocalStorageService.set('token', newAccessToken);
      LocalStorageService.set('enterprise_Id', data.data.data.id);
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        data.data.data.isOnboardingCompleted,
      );
      LocalStorageService.set('enterpriseType', enterpriseOnboardData.type);

      toast.success(data.data.message);

      if (enterpriseOnboardData.type === 'proprietorship') {
        if (isKycVerified) {
          const redirectUrl = LocalStorageService.get('redirectUrl');
          LocalStorageService.remove('redirectUrl'); // Clear the redirect URL
          router.push(redirectUrl || '/');
        } else {
          router.push('/login/kyc');
        }
      } else if (isDirector) {
        router.push('/login/din');
      } else {
        router.push('/login/isDirector'); // moved for director consent
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Oops, Something went wrong!');
    },
  });

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
      LocalStorageService.set('enterprise_Id', data.data.data.id);
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        data.data.data.isOnboardingCompleted,
      );
      LocalStorageService.set('enterpriseType', enterpriseOnboardData.type);

      toast.success(data?.data?.message);

      if (enterpriseOnboardData.type === 'proprietorship') {
        if (isKycVerified) {
          const redirectUrl = LocalStorageService.get('redirectUrl');
          LocalStorageService.remove('redirectUrl'); // Clear the redirect URL
          router.push(redirectUrl || '/');
        } else {
          router.push('/login/kyc');
        }
      } else if (isDirector) {
        router.push('/login/din');
      } else {
        router.push('/login/isDirector'); // moved for director consent
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Oops, Something went wrong!');
    },
  });

  // validation
  const validation = (enterpriseOnboardD) => {
    const error = {};
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

    if (enterpriseOnboardData.doi === '') {
      error.doi = '*Required Date of Incorporation';
    }

    if (enterpriseOnboardD.type !== 'proprietorship') {
      if (enterpriseOnboardD.panNumber === '') {
        error.panNumber = '* Required PAN Number';
      } else if (!panPattern.test(enterpriseOnboardData.panNumber)) {
        error.panNumber = '* Please provide valid PAN Number';
      }
    }

    if (enterpriseOnboardD.type === 'llp' && enterpriseOnboardD.LLPIN === '') {
      error.LLPIN = '* Required LLP IN';
    }
    if (
      (enterpriseOnboardD.type === 'pvt ltd' ||
        enterpriseOnboardD.type === 'public ltd') &&
      enterpriseOnboardD.CIN === ''
    ) {
      error.CIN = '* Required CIN';
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // pan validation
    if (name === 'panNumber') {
      const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (!panPattern.test(value) && value.length !== 10) {
        // Reset error message if PAN is valid
        setErrorMsg({
          ...errorMsg,
          panNumber: '* Please provide valid PAN Number',
        });
      } else {
        // Set error message if PAN is invalid
        setErrorMsg({
          ...errorMsg,
          panNumber: '',
        });
      }
      setEnterpriseOnboardData((values) => ({
        ...values,
        [name]: value.toUpperCase(),
      }));
      return;
    }

    // Handle input type checkbox with value of true/false
    if (type === 'checkbox' && name === 'isDeclerationConsent') {
      setEnterpriseOnboardData((values) => ({
        ...values,
        [name]: checked,
      }));
      return;
    }

    setEnterpriseOnboardData((values) => ({ ...values, [name]: value }));
  };

  const handleEnterpriseSubmit = (e) => {
    e.preventDefault();
    const isError = validation(enterpriseOnboardData);

    if (Object.keys(isError).length === 0) {
      setErrorMsg({});
      if (enterpriseIdByDirectorInvite || enterpriseId) {
        enterpriseOnboardUpdateMutation.mutate({
          id: enterpriseIdByDirectorInvite || enterpriseId,
          data: enterpriseOnboardData,
        });
      } else {
        enterpriseOnboardCreateMutation.mutate(enterpriseOnboardData);
      }
    } else {
      setErrorMsg(isError);
    }
  };

  return (
    <form
      onSubmit={handleEnterpriseSubmit}
      className="flex w-[450px] flex-col items-center justify-between gap-4"
    >
      <div className="flex flex-col gap-4">
        <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
          {enterpriseId || enterpriseIdByDirectorInvite
            ? 'Verify your Enterprise Details'
            : 'Onboard your Enterprise'}
        </h1>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          Enter all the details to unlock Hues completely{' '}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {enterpriseOnboardData.type === 'proprietorship' && (
          <>
            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="panNumber"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                PAN <span className="text-red-600">*</span>{' '}
                <Tooltips
                  trigger={<Info size={12} />}
                  content="PAN: Your universal legal identifier for all government and financial interactions on Hues."
                />
              </Label>
              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="FGHJ1456T"
                  name="panNumber"
                  value={enterpriseOnboardData.panNumber}
                  onChange={handleChange}
                />
              </div>
              {errorMsg.panNumber && <ErrorBox msg={errorMsg.panNumber} />}
            </div>
            <div className="grid w-full max-w-md items-center gap-1.5">
              <Label
                htmlFor="doi"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                Date of Incorporation <span className="text-red-600">*</span>{' '}
                <Tooltips
                  trigger={<Info size={12} />}
                  content="Hues requires age verification for secure transactions, ensuring a trustworthy user experience."
                />
              </Label>

              <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={selectedDate} // Display the current date in the picker
                  onChange={handleDateChange} // Update selected date
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="bottom-end"
                />
              </div>
              {errorMsg.doi && <ErrorBox msg={errorMsg.doi} />}
            </div>

            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="gst"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                GST IN
                <Tooltips trigger={<Info size={12} />} content="GST IN" />
              </Label>

              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="GST IN"
                  name="gstNumber"
                  value={enterpriseOnboardData.gstNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="udyam"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                Udyam
                <Tooltips trigger={<Info size={12} />} content="Udyam" />
              </Label>

              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="Udyam"
                  name="udyam"
                  value={enterpriseOnboardData.udyam}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-start gap-1 px-2">
              <Input
                type="checkbox"
                className="w-12"
                name="isDeclerationConsent"
                onChange={handleChange}
              />
              <span className="text-justify text-xs text-gray-500">
                {`"By selecting this box, I, as the proprietor, affirm my identity
              and the legitimacy of my authorization to act on behalf of the
              proprietorship. I acknowledge that both the proprietorship, all
              persons or entities acting on behalf of the proprietorship, and I
              are jointly and severally liable for any inaccuracies or
              misrepresentations. Furthermore, all persons and entities acting
              on behalf of the proprietorship and I commit to indemnify the
              platform against all liabilities, claims, and damages arising from
              these representations at all times".`}
              </span>
            </div>
          </>
        )}

        {enterpriseOnboardData.type === 'partnership' && (
          <>
            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="panNumber"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                PAN <span className="text-red-600">*</span>{' '}
                <Tooltips
                  trigger={<Info size={12} />}
                  content="PAN: Your universal legal identifier for all government and financial interactions on Hues."
                />
              </Label>
              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="FGHJ1456T"
                  name="panNumber"
                  value={enterpriseOnboardData.panNumber}
                  onChange={handleChange}
                />
              </div>
              {errorMsg.panNumber && <ErrorBox msg={errorMsg.panNumber} />}
            </div>

            <div className="grid w-full max-w-md items-center gap-1.5">
              <Label
                htmlFor="doi"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                Date of Incorporation <span className="text-red-600">*</span>{' '}
                <Tooltips
                  trigger={<Info size={12} />}
                  content="Hues requires age verification for secure transactions, ensuring a trustworthy user experience."
                />
              </Label>

              <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={selectedDate} // Display the current date in the picker
                  onChange={handleDateChange} // Update selected date
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="bottom-end"
                />
              </div>
              {errorMsg.doi && <ErrorBox msg={errorMsg.doi} />}
            </div>

            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="gst"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                GST IN
                <Tooltips trigger={<Info size={12} />} content="GST IN" />
              </Label>

              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="GST IN"
                  name="gstNumber"
                  value={enterpriseOnboardData.gstNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="udyam"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                Udyam
                <Tooltips trigger={<Info size={12} />} content="Udyam" />
              </Label>

              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="Udyam"
                  name="udyam"
                  value={enterpriseOnboardData.udyam}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-start gap-1 px-2">
              <Input
                type="checkbox"
                className="w-12"
                name="isDeclerationConsent"
                checked={enterpriseOnboardData.isDeclerationConsent || false}
                onChange={handleChange}
              />
              <span className="text-justify text-xs text-gray-500">
                {`"By selecting this box, I affirm my identity and the legitimacy of
              my authorization to act on behalf of the partnership. I
              acknowledge that both the partnership, all partners, and all
              persons or entities acting on behalf of the partnership are
              jointly and severally liable for any inaccuracies or
              misrepresentations. Furthermore, all partners and all persons and
              entities acting on behalf of the partnership commit to indemnify
              the platform against all liabilities, claims, and damages arising
              from these representations at all times".`}
              </span>
            </div>
          </>
        )}

        {enterpriseOnboardData.type === 'llp' && (
          <>
            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="panNumber"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                PAN <span className="text-red-600">*</span>{' '}
                <Tooltips
                  trigger={<Info size={12} />}
                  content="PAN: Your universal legal identifier for all government and financial interactions on Hues."
                />
              </Label>
              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="FGHJ1456T"
                  name="panNumber"
                  value={enterpriseOnboardData.panNumber}
                  onChange={handleChange}
                />
              </div>
              {errorMsg.panNumber && <ErrorBox msg={errorMsg.panNumber} />}
            </div>

            <div className="grid w-full max-w-md items-center gap-1.5">
              <Label
                htmlFor="doi"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                Date of Incorporation <span className="text-red-600">*</span>{' '}
                <Tooltips
                  trigger={<Info size={12} />}
                  content="Hues requires age verification for secure transactions, ensuring a trustworthy user experience."
                />
              </Label>

              <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={selectedDate} // Display the current date in the picker
                  onChange={handleDateChange} // Update selected date
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="bottom-end"
                />
              </div>
              {errorMsg.doi && <ErrorBox msg={errorMsg.doi} />}
            </div>

            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="llpIN"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                LLP IN <span className="text-red-600">*</span>{' '}
                <Tooltips trigger={<Info size={12} />} content="GST IN" />
              </Label>

              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="LLP IN"
                  name="LLPIN"
                  value={enterpriseOnboardData.LLPIN}
                  onChange={handleChange}
                />
              </div>
              {errorMsg.LLPIN && <ErrorBox msg={errorMsg.LLPIN} />}
            </div>

            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="gst"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                GST IN
                <Tooltips trigger={<Info size={12} />} content="GST IN" />
              </Label>

              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="GST IN"
                  name="gstNumber"
                  value={enterpriseOnboardData.gstNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="udyam"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                Udyam
                <Tooltips trigger={<Info size={12} />} content="Udyam" />
              </Label>

              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="Udyam"
                  name="udyam"
                  value={enterpriseOnboardData.udyam}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-start gap-1 px-2">
              <Input
                type="checkbox"
                className="w-12"
                name="isDeclerationConsent"
                checked={enterpriseOnboardData.isDeclerationConsent || false}
                onChange={handleChange}
              />
              <span className="text-justify text-xs text-gray-500">
                {`"By selecting this box, I affirm my identity and the legitimacy of
              my authorization to act on behalf of the LLP. I acknowledge that
              both the LLP, all partners, and all persons or entities acting on
              behalf of the LLP are jointly and severally liable for any
              inaccuracies or misrepresentations. Furthermore, all partners and
              all persons and entities acting on behalf of the LLP commit to
              indemnify the platform against all liabilities, claims, and
              damages arising from these representations at all times".`}
              </span>
            </div>
          </>
        )}

        {(enterpriseOnboardData.type === 'pvt ltd' ||
          enterpriseOnboardData.type === 'public ltd') && (
          <>
            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="panNumber"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                PAN <span className="text-red-600">*</span>{' '}
                <Tooltips
                  trigger={<Info size={12} />}
                  content="PAN: Your universal legal identifier for all government and financial interactions on Hues."
                />
              </Label>
              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="FGHJ1456T"
                  name="panNumber"
                  value={enterpriseOnboardData.panNumber}
                  onChange={handleChange}
                />
              </div>
              {errorMsg.panNumber && <ErrorBox msg={errorMsg.panNumber} />}
            </div>

            <div className="grid w-full max-w-md items-center gap-1.5">
              <Label
                htmlFor="doi"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                Date of Incorporation <span className="text-red-600">*</span>{' '}
                <Tooltips
                  trigger={<Info size={12} />}
                  content="Hues requires age verification for secure transactions, ensuring a trustworthy user experience."
                />
              </Label>

              <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={selectedDate} // Display the current date in the picker
                  onChange={handleDateChange} // Update selected date
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="bottom-end"
                />
              </div>
              {errorMsg.doi && <ErrorBox msg={errorMsg.doi} />}
            </div>

            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="CIN"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                CIN <span className="text-red-600">*</span>{' '}
                <Tooltips trigger={<Info size={12} />} content="CIN" />
              </Label>

              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="CIN"
                  name="CIN"
                  value={enterpriseOnboardData.CIN}
                  onChange={handleChange}
                />
              </div>
              {errorMsg.CIN && <ErrorBox msg={errorMsg.CIN} />}
            </div>

            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="gst"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                GST IN
                <Tooltips trigger={<Info size={12} />} content="GST IN" />
              </Label>

              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="GST IN"
                  name="gstNumber"
                  value={enterpriseOnboardData.gstNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid w-full max-w-md items-center gap-1">
              <Label
                htmlFor="udyam"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                Udyam
                <Tooltips trigger={<Info size={12} />} content="Udyam" />
              </Label>

              <div className="relative">
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="Udyam"
                  name="udyam"
                  value={enterpriseOnboardData.udyam}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-start gap-1 px-2">
              <Input
                type="checkbox"
                className="w-12"
                name="isDeclerationConsent"
                checked={enterpriseOnboardData.isDeclerationConsent || false}
                onChange={handleChange}
              />
              <span className="text-justify text-xs text-gray-500">
                {enterpriseOnboardData.type === 'privateLimited'
                  ? `"By selecting this box, I affirm my identity and the legitimacy of my authorization to act on behalf of the Company. I acknowledge that both the Company, all Directors, and all persons or entities acting on behalf of the Company are jointly and severally liable for any inaccuracies or misrepresentations. Furthermore, all partners and all persons and entities acting on behalf of the Company commit to indemnify the platform against all liabilities, claims, and damages arising from these representations at all times".`
                  : `"By selecting this box, I affirm my identity and the legitimacy of my authorization to act on behalf of the Company. I acknowledge that both the Company, all Directors, and all persons or entities acting on behalf of the Company are jointly and severally liable for any inaccuracies or misrepresentations. Furthermore, all Directors and all persons and entities acting on behalf of the Company commit to indemnify the platform against all liabilities, claims, and damages arising from these representations at all times".`}
              </span>
            </div>
          </>
        )}

        <div className="flex w-full flex-col gap-4">
          <Button
            size="sm"
            type="submit"
            className="w-full bg-[#288AF9]"
            disabled={
              enterpriseOnboardCreateMutation.isPending ||
              enterpriseOnboardUpdateMutation.isPending
            }
          >
            {enterpriseOnboardCreateMutation.isPending ||
            enterpriseOnboardUpdateMutation.isPending ? (
              <Loading />
            ) : (
              'Submit'
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEnterpriseDetailsCurrStep(1)} //  back to enterpriseDetails 1
          >
            <ArrowLeft size={14} />
            Back
          </Button>
        </div>
        <Link
          href="/"
          className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
        >
          Skip for Now
        </Link>
      </div>
    </form>
  );
};

export default EnterpriseDetailsSecond;
