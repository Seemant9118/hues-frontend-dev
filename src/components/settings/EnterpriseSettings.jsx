'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';

import { templateApi } from '@/api/templates_api/template_api';
import { userAuth } from '@/api/user_auth/Users';
import {
  updateEnterpriseData,
  uploadLogo,
} from '@/services/Settings_Services/SettingsService';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, Pencil, Save, ShieldCheck, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import Avatar from '../ui/Avatar';
import Wrapper from '../wrappers/Wrapper';

const turnoverOptions = [
  'Below ₹10 lakh',
  '₹10 lakh – ₹40 lakh',
  '₹40 lakh – ₹1.5 crore',
  '₹1.5 crore – ₹5 crore',
  'Above ₹5 crore',
];

const defaultEnterpriseData = {
  logoText: 'PT',
  logoUrl: '',
  entityName: 'Paraphernalia Technologies Private Limited',
  entityType: 'Private Limited',
  pan: 'AE******1G',
  incorporationDate: '15 Mar 2020',
  about: '',
  annualTurnoverRange: '₹40 lakh – ₹1.5 crore',

  // LINKS
  website: '',
  linkedin: '',
  twitter: '',
  instagram: '',
  youTube: '',
};

export default function EnterpriseSettings({ translations, profileDetails }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isAboutEditing, setIsAboutEditing] = useState(false);
  const [isLinksEditings, setIsLinksEditing] = useState(false);
  const [isCommercialSettings, setIsCommercialSettings] = useState(false);

  const [savedData, setSavedData] = useState(defaultEnterpriseData);
  const [draftData, setDraftData] = useState(defaultEnterpriseData);

  const enterpriseDetails = profileDetails?.enterpriseDetails;

  useEffect(() => {
    if (!enterpriseDetails) return;

    setSavedData((prev) => ({
      ...prev,
      about: enterpriseDetails?.metaData?.description || '',
      annualTurnoverRange:
        enterpriseDetails?.metaData?.commercialOverview || '',

      website: enterpriseDetails?.metaData?.website || '',
      linkedin: enterpriseDetails?.metaData?.linkedin || '',
      twitter: enterpriseDetails?.metaData?.twitter || '',
      instagram: enterpriseDetails?.metaData?.instagram || '',
      youTube: enterpriseDetails?.metaData?.youTube || '',
    }));

    setDraftData((prev) => ({
      ...prev,
      about: enterpriseDetails?.metaData?.description || '',
      annualTurnoverRange:
        enterpriseDetails?.metaData?.commercialOverview || '',

      website: enterpriseDetails?.metaData?.website || '',
      linkedin: enterpriseDetails?.metaData?.linkedin || '',
      twitter: enterpriseDetails?.metaData?.twitter || '',
      instagram: enterpriseDetails?.metaData?.instagram || '',
      youTube: enterpriseDetails?.metaData?.youTube || '',
    }));
  }, [enterpriseDetails]);

  // const profileCompletion = useMemo(() => {
  //   // Simple logic for demo (you can change this as per backend)
  //   let score = 0;
  //   const total = 4;

  //   if (savedData?.logoUrl || savedData?.logoText) score++;
  //   if (savedData?.about?.trim()?.length > 0) score++;
  //   if (savedData?.annualTurnoverRange) score++;
  //   if (savedData?.entityName) score++;

  //   return Math.round((score / total) * 100);
  // }, [savedData]);

  const handleEdit = ({ setIsEditing }) => {
    setDraftData(savedData);
    setIsEditing(true);
  };

  const handleCancel = ({ setIsEditing }) => {
    setDraftData(savedData);
    setIsEditing(false);
  };

  const handleChange = (key, value) => {
    setDraftData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const isDirty = useMemo(() => {
    return JSON.stringify(savedData) !== JSON.stringify(draftData);
  }, [savedData, draftData]);

  const openFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const pvtUrl = profileDetails?.enterpriseDetails?.logoUrl;

  // Fetch the public logo url
  const { data: publicUrl } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, pvtUrl],
    queryFn: () => getDocument(pvtUrl),
    enabled: !!pvtUrl,
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

  const updateEnterpriseMutation = useMutation({
    mutationFn: updateEnterpriseData,
    onSuccess: () => {
      toast.success('Enterprise details updated successfully');
      queryClient.invalidateQueries({
        queryKey: [userAuth.getProfileDetails.endpointKey],
        exact: false,
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Update failed');
    },
  });

  const handleSave = ({ setIsEditing }) => {
    const payload = {};

    // ABOUT
    if (draftData.about !== savedData.about) {
      payload.description = draftData.about;
    }

    // COMMERCIAL OVERVIEW
    if (draftData.annualTurnoverRange !== savedData.annualTurnoverRange) {
      payload.commercialOverview = draftData.annualTurnoverRange;
    }

    // LINKS
    const linkKeys = ['website', 'linkedin', 'twitter', 'instagram', 'youTube'];

    linkKeys.forEach((key) => {
      if (draftData[key] !== savedData[key]) {
        payload[key] = draftData[key] || null;
      }
    });

    if (!Object.keys(payload).length) {
      setIsEditing(false);
      return;
    }

    updateEnterpriseMutation.mutate({ data: payload });

    setSavedData(draftData);
    setIsEditing(false);
  };

  return (
    <Wrapper>
      {/* Top Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LOGO CARD */}
        <Card className="flex rounded-2xl bg-white p-4 shadow-sm lg:col-span-3">
          <div className="flex w-full items-center justify-start gap-4">
            {profileDetails?.enterpriseDetails?.logoUrl ? (
              <Image
                src={publicUrl?.publicUrl}
                alt="logo"
                width={80}
                height={80}
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <Avatar name={profileDetails?.enterpriseDetails?.name} />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold">
                {translations('tabs.content.tab1.profilePicSection.title')}
              </span>
              <span className="text-xs text-grey">
                {translations('tabs.content.tab1.profilePicSection.format')}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
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
        </Card>

        {/* PROFILE COMPLETION */}
        {/* <Card className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-primary">
                PROFILE COMPLETION
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete your profile to build trust and improve discovery.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div className="text-4xl font-semibold">{profileCompletion}%</div>
            <div className="text-sm text-muted-foreground">complete</div>
          </div>

          <div className="mt-4">
            <Progress value={profileCompletion} />
          </div>

          <Separator className="my-5" />

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Suggested actions
            </p>

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-muted"
            >
              Upload an enterprise logo
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </Card> */}
      </div>

      {/* Legal Identity */}
      <Card className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold tracking-wide text-primary">
              LEGAL IDENTITY
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Managed via verified agency records
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
          <InfoBlock
            label="Entity name"
            value={enterpriseDetails?.name || savedData.entityName}
            locked
          />
          <InfoBlock
            label="Entity type"
            value={enterpriseDetails?.type || savedData.entityType}
            locked
          />
          <InfoBlock
            label="PAN"
            value={enterpriseDetails?.panNumber || savedData.pan}
            locked
          />
          <InfoBlock
            label="Date of incorporation"
            value={enterpriseDetails?.doi || savedData.incorporationDate}
            locked
          />
        </div>
      </Card>

      {/* About the enterprise */}
      <Card className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-wide text-primary">
            ABOUT THE ENTERPRISE
          </p>

          {!isAboutEditing ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => handleEdit({ setIsEditing: setIsAboutEditing })}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : null}
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Shown on your public profile. Max 1000 characters. Links allowed.
        </p>

        <div className="mt-5">
          <Textarea
            value={draftData.about}
            placeholder="Write something about your enterprise..."
            disabled={!isAboutEditing}
            onChange={(e) => handleChange('about', e.target.value)}
            className={cn(
              'min-h-[120px] rounded-xl',
              !isAboutEditing && 'opacity-90',
            )}
          />
        </div>

        {/* Actions */}
        {isAboutEditing ? (
          <div className="mt-4 flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => handleCancel({ setIsEditing: setIsAboutEditing })}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => handleSave({ setIsEditing: setIsAboutEditing })}
              disabled={!isDirty}
            >
              <Save className="h-4 w-4" />
              Save changes
            </Button>
          </div>
        ) : null}
      </Card>

      {/* LINKS */}
      <Card className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-wide text-primary">
            LINKS
          </p>

          {!isLinksEditings ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => handleEdit({ setIsEditing: setIsLinksEditing })}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : null}
        </div>

        <div className="mt-6 max-w-2xl space-y-5">
          <LinkInput
            label="Website"
            value={draftData.website}
            placeholder="https://yourcompany.com"
            disabled={!isLinksEditings}
            onChange={(v) => handleChange('website', v)}
          />

          <LinkInput
            label="LinkedIn"
            value={draftData.linkedin}
            placeholder="https://linkedin.com/company/..."
            disabled={!isLinksEditings}
            onChange={(v) => handleChange('linkedin', v)}
          />

          <LinkInput
            label="X"
            value={draftData.twitter}
            placeholder="https://x.com/..."
            disabled={!isLinksEditings}
            onChange={(v) => handleChange('twitter', v)}
          />

          <LinkInput
            label="Instagram"
            value={draftData.instagram}
            placeholder="https://instagram.com/..."
            disabled={!isLinksEditings}
            onChange={(v) => handleChange('instagram', v)}
          />

          <LinkInput
            label="YouTube"
            value={draftData.youTube}
            placeholder="https://youtube.com/@..."
            disabled={!isLinksEditings}
            onChange={(v) => handleChange('youTube', v)}
          />
        </div>

        {isLinksEditings ? (
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => handleCancel({ setIsEditing: setIsLinksEditing })}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => handleSave({ setIsEditing: setIsLinksEditing })}
              disabled={!isDirty}
            >
              <Save className="h-4 w-4" />
              Save changes
            </Button>
          </div>
        ) : null}
      </Card>

      {/* Commercial Overview */}
      <Card className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-wide text-primary">
            COMMERCIAL OVERVIEW
          </p>

          {!isCommercialSettings ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() =>
                handleEdit({ setIsEditing: setIsCommercialSettings })
              }
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : null}
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Used for public profile display. Select the range that best represents
          your enterprise.
        </p>

        <div className="mt-5 max-w-lg space-y-2">
          <Label className="text-sm font-medium">Annual Turnover (Range)</Label>

          <Select
            value={
              enterpriseDetails?.commercialOverview ||
              draftData.annualTurnoverRange
            }
            onValueChange={(v) => handleChange('annualTurnoverRange', v)}
            disabled={!isCommercialSettings}
          >
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select turnover range" />
            </SelectTrigger>
            <SelectContent>
              {turnoverOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        {isCommercialSettings ? (
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() =>
                handleCancel({ setIsEditing: setIsCommercialSettings })
              }
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() =>
                handleSave({ setIsEditing: setIsCommercialSettings })
              }
              disabled={!isDirty}
            >
              <Save className="h-4 w-4" />
              Save changes
            </Button>
          </div>
        ) : null}
      </Card>
    </Wrapper>
  );
}

/* Small helper UI blocks    */
function InfoBlock({ label, value, locked }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{label}</span>
        {locked ? <Lock size={14} /> : null}
      </div>
      <div className="text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}

function LinkInput({ label, value, placeholder, disabled, onChange }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <input
        type="url"
        value={value || ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition',
          'focus:ring-2 focus:ring-blue-500',
          disabled && 'cursor-not-allowed opacity-70',
        )}
      />
    </div>
  );
}
