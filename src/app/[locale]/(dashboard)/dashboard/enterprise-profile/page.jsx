'use client';

import { settingsAPI } from '@/api/settings/settingsApi';
import { templateApi } from '@/api/templates_api/template_api';
import { userAuth } from '@/api/user_auth/Users';
import { capitalize, getEnterpriseId } from '@/appUtils/helperFunctions';
import Avatar from '@/components/ui/Avatar';
import SubHeader from '@/components/ui/Sub-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import { getGstSettings } from '@/services/Settings_Services/SettingsService';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  ExternalLink,
  Globe,
  Link2,
  Mail,
  MapPin,
  Phone,
  Settings,
} from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function EnterpriseProfile() {
  useMetaData(`Enterprise Profile`, 'HUES ENTEPRRISE PROFILE');
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = getEnterpriseId();
  const translations = useTranslations('enterpriseProfile');
  const { hasPermission } = usePermission();
  const router = useRouter();
  const [tab, setTab] = useState('enterpriseOverview');

  const onTabChange = (value) => setTab(value);

  // fetch profileDetails API
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled:
      tab === 'enterpriseOverview' &&
      hasPermission('permission:view-dashboard'),
  });
  // enterprieDetails
  const enterprise = profileDetails?.enterpriseDetails;

  // logo: pvt url
  const pvtUrl = enterprise?.logoUrl;
  // Fetch the public logo url
  const { data: publicUrl } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, pvtUrl],
    queryFn: () => getDocument(pvtUrl),
    enabled: !!pvtUrl,
    select: (res) => res.data.data,
  });

  // fetch gst related data
  const { data: gstRegistrations } = useQuery({
    queryKey: [settingsAPI.getGstSettings.endpointKey],
    queryFn: () => getGstSettings({ id: enterpriseId }),
    select: (data) => data.data.data,
  });

  const complianceItems = [
    {
      label: 'GST',
      status: enterprise?.isGstVerified ? 'Registered' : null,
      active: !!enterprise?.gstNumber,
    },
    {
      label: 'Income Tax (PAN)',
      status: enterprise?.isCinVerified ? 'Verified' : null,
      active: !!enterprise?.panNumber,
    },
    {
      label: 'Corporate Identity (CIN)',
      status: enterprise?.cin ? 'Verified' : null,
      active: !!enterprise?.cin,
    },
    {
      label: 'MSME (UDYAM)',
      status: enterprise?.isUdyamVerified ? 'Verified' : null,
      active: !!enterprise?.udyam,
    },
  ];

  const links = [
    {
      label: 'Website',
      value: enterprise?.metaData?.website || '-',
      icon: Globe,
    },
    {
      label: 'LinkedIn',
      value: enterprise?.metaData?.linkedin || '-',
      icon: Link2,
    },
    {
      label: 'Twitter',
      value: enterprise?.metaData?.twitter || '-',
      icon: Link2,
    },
    {
      label: 'Instagram',
      value: enterprise?.metaData?.instagram || '-',
      icon: Link2,
    },
    {
      label: 'YouTube',
      value: enterprise?.metaData?.youTube || '-',
      icon: Link2,
    },
  ];
  const visibleLinks = links.filter(
    (link) => link.value && link.value !== '-' && link.value.trim() !== '',
  );

  const getExternalLink = (url) => {
    if (!url) return '#';
    return url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;
  };

  return (
    <ProtectedWrapper permissionCode="permission:view-dashboard">
      <Wrapper className="h-full">
        <SubHeader name={translations('title')}></SubHeader>

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
          </TabsList>

          <TabsContent value="enterpriseOverview">
            {/* If enterprise not completed */}
            {!enterprise?.id && (
              <div className="relative mt-4">
                <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-sm bg-[#dedede88]"></div>
                <div className="grid grid-cols-3 grid-rows-2 gap-8 rounded-sm border bg-white p-4">
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

            {/* If enterprise exists */}
            {enterprise?.id && (
              <div className="flex flex-col gap-4">
                {/* TOP ENTERPRISE HEADER CARD */}
                <Card className="rounded-2xl border p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* left: logo + title */}
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full border bg-muted">
                        {enterprise?.logoUrl ? (
                          <Image
                            src={publicUrl?.publicUrl}
                            alt="logo"
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Avatar name={enterprise?.name} />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-black">
                            {enterprise?.name || '-'}
                          </h2>

                          {(enterprise?.type === 'proprietorship' &&
                            enterprise.isUdyamVerified) ||
                            (enterprise?.type !== 'proprietorship' &&
                              enterprise.isCinVerified && (
                                <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                  {translations(
                                    'tabs.content.tab1.header.verified',
                                  )}
                                </Badge>
                              ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          {enterprise?.cin && (
                            <span className="font-medium">
                              {translations('tabs.content.tab1.header.cin')}{' '}
                              <span className="font-semibold text-black">
                                {enterprise?.cin || '-'}
                              </span>
                            </span>
                          )}

                          <span>
                            {capitalize(enterprise?.type) || 'Private Limited'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* right: actions + completeness */}
                    <div className="flex flex-col gap-3 md:items-end">
                      <div className="flex items-center gap-2">
                        <Button disabled variant="outline" size="sm">
                          <ExternalLink size={14} />
                          {translations('tabs.content.tab1.header.catalogue')}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/enterprise-profile/settings`,
                            )
                          }
                        >
                          <Settings size={14} />
                          {translations('tabs.content.tab1.header.settings')}
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground">
                            {moment(enterprise?.updatedAt).format(
                              'DD/MM/YYYY HH:mm',
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {/* LEFT SIDE (2/3) */}
                  <div className="flex flex-col gap-4 lg:col-span-2">
                    {/* ABOUT THE ENTERPRISE */}
                    <Card className="rounded-2xl border p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        {translations('tabs.content.tab1.sections.about.title')}
                      </h3>

                      {enterprise?.metaData?.description?.trim() ? (
                        <p className="mt-3 text-sm leading-relaxed">
                          {enterprise.metaData.description}
                        </p>
                      ) : (
                        <div className="mt-3 rounded-xl border border-dashed bg-muted/30 px-4 py-3">
                          <p className="text-sm font-medium">
                            {translations(
                              'tabs.content.tab1.sections.about.noDescription',
                            )}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {translations(
                              'tabs.content.tab1.sections.about.addDescription',
                            )}{' '}
                            <span
                              onClick={() =>
                                router.push(
                                  `/dashboard/enterprise-profile/settings`,
                                )
                              }
                              className="cursor-pointer font-medium text-foreground hover:underline"
                            >
                              {translations(
                                'tabs.content.tab1.sections.about.settingsLink',
                              )}
                            </span>{' '}
                            {translations(
                              'tabs.content.tab1.sections.about.helpText',
                            )}
                          </p>
                        </div>
                      )}
                    </Card>

                    {/* COMPLIANCE SNAPSHOT */}
                    <Card className="rounded-2xl border p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        {translations(
                          'tabs.content.tab1.sections.compliance.title',
                        )}
                      </h3>

                      <div className="mt-4 flex flex-col gap-4">
                        {complianceItems
                          .filter((item) => item.active)
                          .map((item) => (
                            <div key={item.label}>
                              <div className="flex items-center justify-between py-2">
                                <span className="text-sm">{item.label}</span>

                                <div className="flex items-center gap-2">
                                  {item.status && (
                                    <Badge className="gap-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                      <CheckCircle2 size={14} />
                                      {item.status}
                                    </Badge>
                                  )}

                                  <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                    {translations(
                                      'tabs.content.tab1.sections.compliance.status.active',
                                    )}
                                  </Badge>
                                </div>
                              </div>

                              <Separator />
                            </div>
                          ))}
                      </div>
                    </Card>

                    {/* TAX BEHAVIOUR MARKERS */}
                    {(enterprise?.isGtaService ||
                      enterprise?.isLegalService) && (
                      <Card className="rounded-2xl border p-5">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                          {translations(
                            'tabs.content.tab1.sections.taxBehaviour.title',
                          )}
                        </h3>

                        <div className="mt-4 flex items-center gap-2">
                          {enterprise?.isGtaService && (
                            <Badge
                              variant="outline"
                              className="rounded-full border border-primary px-4 py-2 text-sm text-primary"
                            >
                              {translations(
                                'tabs.content.tab1.sections.taxBehaviour.gtaService',
                              )}
                            </Badge>
                          )}
                          {enterprise?.isLegalService && (
                            <Badge
                              variant="outline"
                              className="rounded-full border border-primary px-4 py-2 text-sm text-primary"
                            >
                              {translations(
                                'tabs.content.tab1.sections.taxBehaviour.legalService',
                              )}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-xs italic text-muted-foreground">
                          {translations(
                            'tabs.content.tab1.sections.taxBehaviour.disclaimer',
                          )}
                        </p>
                      </Card>
                    )}

                    {/* COMMERCIAL OVERVIEW */}
                    {enterprise?.metaData?.commercialOverview && (
                      <Card className="rounded-2xl border p-5">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                          {translations(
                            'tabs.content.tab1.sections.commercialOverview.title',
                          )}
                        </h3>

                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground">
                            {translations(
                              'tabs.content.tab1.sections.commercialOverview.annualTurnover',
                            )}
                          </span>
                          <span className="text-sm font-semibold text-black">
                            {enterprise?.metaData?.commercialOverview ||
                              '₹40 lakh – ₹1.5 crore'}
                          </span>
                        </div>
                      </Card>
                    )}

                    {/* GST REGISTRATIONS */}
                    {gstRegistrations?.gsts?.length > 0 &&
                      gstRegistrations.gsts.map((gst) => {
                        const principalAddress =
                          gst?.addresses?.find(
                            (addr) =>
                              addr.subType === 'PRINCIPAL_PLACE_OF_BUSINESS',
                          ) || null;

                        return (
                          <Card key={gst.id} className="rounded-2xl border p-5">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                              {translations(
                                'tabs.content.tab1.sections.gstRegistrations.title',
                              )}
                            </h3>

                            <p className="mt-2 text-xs text-muted-foreground">
                              {translations(
                                'tabs.content.tab1.sections.gstRegistrations.description',
                              )}
                            </p>

                            <div className="mt-4 flex flex-col gap-4">
                              <Card className="rounded-2xl border bg-gray-50 p-5">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-base font-semibold">
                                    {principalAddress?.pincodeEntity?.state ||
                                      'State'}
                                  </h4>

                                  {gst?.isVerified && (
                                    <Badge className="rounded-full bg-emerald-50 text-emerald-700">
                                      {translations(
                                        'tabs.content.tab1.sections.gstRegistrations.active',
                                      )}
                                    </Badge>
                                  )}
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground">
                                      {translations(
                                        'tabs.content.tab1.sections.gstRegistrations.gstin',
                                      )}
                                    </span>

                                    <span className="text-lg font-semibold">
                                      {gst?.gst || '—'}
                                    </span>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <span className="px-2 text-xs text-muted-foreground">
                                      {translations(
                                        'tabs.content.tab1.sections.gstRegistrations.gstStatus',
                                      )}
                                    </span>

                                    <div className="flex flex-wrap items-center gap-2">
                                      {gst?.isVerified && (
                                        <Badge className="rounded-full bg-emerald-50 text-emerald-700">
                                          {translations(
                                            'tabs.content.tab1.sections.gstRegistrations.gstRegistered',
                                          )}
                                        </Badge>
                                      )}

                                      <Badge
                                        variant="secondary"
                                        className="rounded-full"
                                      >
                                        {gst?.registrationType ||
                                          'Normal / Regular'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {principalAddress && (
                                  <div className="mt-4 flex flex-col items-start gap-2 text-sm">
                                    <div className="flex items-center gap-1">
                                      <MapPin size={14} />
                                      <p>
                                        {translations(
                                          'tabs.content.tab1.sections.gstRegistrations.principalPlace',
                                        )}
                                      </p>
                                    </div>
                                    <p>
                                      {principalAddress?.address ||
                                        'Principal address not available'}
                                    </p>
                                  </div>
                                )}
                              </Card>
                            </div>
                          </Card>
                        );
                      })}
                  </div>

                  {/* RIGHT SIDE (1/3) */}
                  <div className="flex flex-col gap-4">
                    {/* CONTACT */}
                    <Card className="rounded-2xl border p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                          {translations(
                            'tabs.content.tab1.sections.contact.title',
                          )}
                        </h3>

                        <div className="flex items-center gap-2">
                          {/* <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyContact}
                          >
                            <Copy size={14} /> Copy contact
                          </Button> */}

                          {/* <Button disabled variant="outline" size="icon">
                            <QrCode size={16} />
                          </Button> */}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                            <Mail size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              {translations(
                                'tabs.content.tab1.sections.contact.email',
                              )}
                            </span>
                            <span className="text-sm font-semibold">
                              {enterprise?.email || 'contact@yourcompany.com'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                            <Phone size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              {translations(
                                'tabs.content.tab1.sections.contact.phone',
                              )}
                            </span>
                            {enterprise?.mobileNumber ? (
                              <span className="text-sm font-semibold">
                                {translations(
                                  'tabs.content.tab1.sections.contact.phonePrefix',
                                )}{' '}
                                {enterprise?.mobileNumber ||
                                  translations(
                                    'tabs.content.tab1.sections.contact.defaultPhone',
                                  )}
                              </span>
                            ) : (
                              <span>-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* LINKS */}
                    <Card className="rounded-2xl border p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        {translations('tabs.content.tab1.sections.links.title')}
                      </h3>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {translations(
                          'tabs.content.tab1.sections.links.description',
                        )}
                      </p>

                      <div className="mt-4">
                        {visibleLinks.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            {visibleLinks.map((link) => {
                              const Icon = link.icon;

                              return (
                                <div
                                  key={link.label}
                                  className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                      <Icon size={16} />
                                    </div>

                                    <div className="flex flex-col">
                                      <span className="text-xs text-muted-foreground">
                                        {link.label}
                                      </span>
                                      <span className="max-w-[180px] truncate text-sm font-semibold">
                                        {link.value}
                                      </span>
                                    </div>
                                  </div>

                                  <a
                                    href={getExternalLink(link.value)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="outline" size="icon">
                                      <ExternalLink size={16} />
                                    </Button>
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed bg-muted/30 px-4 py-6 text-center">
                            <p className="text-sm font-medium">
                              {translations(
                                'tabs.content.tab1.sections.links.noLinks',
                              )}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {translations(
                                'tabs.content.tab1.sections.links.addLinks',
                              )}{' '}
                              <span
                                onClick={() =>
                                  router.push(
                                    `/dashboard/enterprise-profile/settings`,
                                  )
                                }
                                className="cursor-pointer font-medium text-foreground hover:underline"
                              >
                                {translations(
                                  'tabs.content.tab1.sections.links.settingsLink',
                                )}
                              </span>{' '}
                              {translations(
                                'tabs.content.tab1.sections.links.helpText',
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Wrapper>
    </ProtectedWrapper>
  );
}

export default EnterpriseProfile;
