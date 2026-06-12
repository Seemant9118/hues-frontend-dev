'use client';

import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import {
  getEnterpriseId,
  convertSnakeToTitleCase,
} from '@/appUtils/helperFunctions';
import ErrorBox from '@/components/ui/ErrorBox';
import { rolesApi } from '@/api/rolesApi/rolesApi';
import { getRoles } from '@/services/Roles_Services/Roles_Services';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sendInviteToExternalMember } from '@/services/Associate_Members_Services/AssociateMembersServices';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { getVendors } from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Link2,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const PAGE = 1;
const LIMIT = 100;

export default function CreateExternalMemberModal({ isOpen, setIsOpen }) {
  const enterpriseId = getEnterpriseId();
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationKey: [associateMemberApi.sendInviteToExternalMember.endpointKey],
    mutationFn: sendInviteToExternalMember,
    onSuccess: () => {
      toast.success('Invitation sent to external member successfully!');
      queryClient.invalidateQueries([
        associateMemberApi.getAllAssociateMembers.endpointKey,
        enterpriseId,
      ]);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    },
  });

  const { isPending } = inviteMutation;

  const [step, setStep] = useState(1);
  const [contactMode, setContactMode] = useState('Client'); // 'Client' or 'Vendor'
  const [selectedContactId, setSelectedContactId] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [errors, setErrors] = useState({});
  const [consentAccepted, setConsentAccepted] = useState(false);

  const { data: clientsData = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['getClients', enterpriseId, 'ACCEPTED'],
    queryFn: () =>
      getClients({
        id: enterpriseId,
        status: 'ACCEPTED',
        page: PAGE,
        limit: LIMIT,
      }),
    select: (res) => {
      const users = res?.data?.data?.users || [];
      return users.map((user) => {
        const details = user.client || user.invitation?.userDetails || {};
        return {
          id: details.id || user.id,
          tradeName: details.tradeName || details.name || '',
          legalName: details.legalName || details.name || '',
          gstin: details.gsts?.[0]?.gst || '',
          pan: details.panNumber || '',
          email: details.email || '',
          phone: details.mobileNumber || '',
          type: 'Client',
          status: user.invitation?.status || 'ACCEPTED',
        };
      });
    },
    enabled: !!isOpen && contactMode === 'Client',
  });

  const { data: vendorsData = [], isLoading: isVendorsLoading } = useQuery({
    queryKey: ['getVendors', enterpriseId, 'ACCEPTED'],
    queryFn: () =>
      getVendors({
        id: enterpriseId,
        status: 'ACCEPTED',
        page: PAGE,
        limit: LIMIT,
      }),
    select: (res) => {
      const users = res?.data?.data?.users || [];
      return users.map((user) => {
        const details = user.vendor || user.invitation?.userDetails || {};
        return {
          id: details.id || user.id,
          tradeName: details.tradeName || details.name || '',
          legalName: details.legalName || details.name || '',
          gstin: details.gstin || '',
          pan: details.pan || '',
          email: details.email || '',
          phone: details.mobileNumber || details.phone || '',
          type: 'Vendor',
          status: user.invitation?.status || 'ACCEPTED',
        };
      });
    },
    enabled: !!isOpen && contactMode === 'Vendor',
  });

  const contactsList = contactMode === 'Client' ? clientsData : vendorsData;

  // Form states
  const [memberIdentity, setMemberIdentity] = useState({
    legalName: '',
    tradeName: '',
    email: '',
    phone: '',
    roles: [],
    gstin: '',
    pan: '',
  });

  const [optionsForRoles, setOptionsForRoles] = useState([]);

  // Load roles list
  const { data: rolesList } = useQuery({
    queryKey: [rolesApi.getAllRoles.endpointKey],
    queryFn: getRoles,
    select: (data) => data?.data?.data || [],
    enabled: !!isOpen,
  });

  useEffect(() => {
    if (!rolesList) return;
    const options = rolesList.map((role) => ({
      value: role?.id,
      label: convertSnakeToTitleCase(role?.name),
    }));
    setOptionsForRoles(options);
  }, [rolesList]);

  const handleSelectRole = (roleIdVal) => {
    const roleId = Number(roleIdVal);
    if (!memberIdentity.roles.includes(roleId)) {
      setMemberIdentity((prev) => ({
        ...prev,
        roles: [...prev.roles, roleId],
      }));
      if (errors.roles) {
        setErrors((prev) => ({ ...prev, roles: '' }));
      }
    }
  };

  const handleRemoveRole = (roleId) => {
    setMemberIdentity((prev) => ({
      ...prev,
      roles: prev.roles.filter((id) => id !== roleId),
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!selectedContactId) {
      newErrors.selectedContactId = 'Please select a contact entity';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!memberIdentity.legalName.trim()) {
      newErrors.legalName = 'Legal name is required';
    }
    if (!memberIdentity.email.trim()) {
      newErrors.email = 'Registered email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(memberIdentity.email.trim())) {
        newErrors.email = 'Invalid email format';
      }
    }
    if (memberIdentity.phone.trim()) {
      const cleanedPhone = memberIdentity.phone.trim().replace(/[\s-]/g, '');
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(cleanedPhone)) {
        newErrors.phone = 'Invalid phone number format (must be 10-15 digits)';
      }
    }
    if (!memberIdentity.roles || memberIdentity.roles.length === 0) {
      newErrors.roles = 'Member roles are required';
    }
    if (memberIdentity.gstin.trim()) {
      const gstinRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
      if (!gstinRegex.test(memberIdentity.gstin.trim())) {
        newErrors.gstin = 'Invalid GSTIN format (e.g. 27AABCM1234A1Z5)';
      }
    }
    if (memberIdentity.pan.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
      if (!panRegex.test(memberIdentity.pan.trim())) {
        newErrors.pan = 'Invalid PAN format (e.g. AABCM1234A)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sync selected contact details into Member Identity when selected contact changes
  useEffect(() => {
    setErrors({});
    if (selectedContact) {
      setMemberIdentity({
        legalName: selectedContact.legalName,
        tradeName: selectedContact.tradeName,
        email: selectedContact.email,
        phone: selectedContact.phone,
        roles: memberIdentity.roles, // preserve roles
        gstin: selectedContact.gstin,
        pan: selectedContact.pan,
      });
    }
  }, [selectedContact]);

  // Sync selected contact when contactMode (Client/Vendor) or contactsList changes
  useEffect(() => {
    if (contactsList.length > 0) {
      const exists = contactsList.find((c) => c.id === selectedContactId);
      if (!exists) {
        setSelectedContactId(contactsList[0].id);
        setSelectedContact(contactsList[0]);
      }
    } else {
      setSelectedContactId('');
      setSelectedContact(null);
    }
  }, [contactMode, contactsList]);

  // Handle contact dropdown change
  const handleContactChange = (val) => {
    setSelectedContactId(val);
    const contact = contactsList.find((c) => c.id === val);
    setSelectedContact(contact);
    if (errors.selectedContactId) {
      setErrors((prev) => ({ ...prev, selectedContactId: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMemberIdentity((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleConsentChange = (checked) => {
    setConsentAccepted(checked);
    if (checked && errors.consent) {
      setErrors((prev) => ({ ...prev, consent: '' }));
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleSubmit = () => {
    if (!consentAccepted) {
      setErrors({
        consent: 'You must accept the consent terms and conditions to proceed.',
      });
      return;
    }

    const payload = {
      fromEnterpriseId: enterpriseId,
      toEnterpriseId: selectedContact?.id || null,
      email: memberIdentity.email,
      roleIds: memberIdentity.roles,
    };

    inviteMutation.mutate(payload);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // Reset state on close
          setStep(1);
          setContactMode('Client');
          setSelectedContactId('');
          setSelectedContact(null);
          setConsentAccepted(false);
          setErrors({});
          setMemberIdentity({
            legalName: '',
            tradeName: '',
            email: '',
            phone: '',
            roles: [],
            gstin: '',
            pan: '',
          });
        }
      }}
    >
      <DialogContent className="max-w-[700px] gap-0 overflow-hidden rounded-lg border border-gray-100 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-bold text-[#0D3B66]">
            Create External Member
          </DialogTitle>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#fafafa]/50 px-2 py-6">
          {/* Step 1 Item */}
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                <Check className="h-4 w-4" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                <Link2 className="h-4 w-4" />
              </div>
            )}
            <span
              className={`text-sm font-bold ${step >= 1 ? 'text-[#0D3B66]' : 'text-gray-400'}`}
            >
              Link Contact
            </span>
          </div>

          <ChevronRight className="h-4 w-4 text-gray-300" />

          {/* Step 2 Item */}
          <div className="flex items-center gap-2">
            {step > 2 ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                <Check className="h-4 w-4" />
              </div>
            ) : (
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}
              >
                <User className="h-4 w-4" />
              </div>
            )}
            <span
              className={`text-sm font-bold ${step >= 2 ? 'text-[#0D3B66]' : 'text-gray-400'}`}
            >
              Member Identity
            </span>
          </div>

          <ChevronRight className="h-4 w-4 text-gray-300" />

          {/* Step 3 Item */}
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 3 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              <FileText className="h-4 w-4" />
            </div>
            <span
              className={`text-sm font-bold ${step === 3 ? 'text-[#0D3B66]' : 'text-gray-400'}`}
            >
              Consent
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div className="navScrollBarStyles max-h-[60vh] min-h-[320px] overflow-y-auto py-6 pr-1">
          {/* STEP 1: LINK CONTACT */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <RadioGroup
                value={contactMode}
                onValueChange={setContactMode}
                className="grid grid-cols-2 gap-4"
              >
                {/* Option: Client */}
                <div
                  onClick={() => setContactMode('Client')}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                    contactMode === 'Client'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value="Client" id="contact-mode-client" />
                  <Label
                    htmlFor="contact-mode-client"
                    className="cursor-pointer text-sm font-bold text-[#0D3B66]"
                  >
                    Client
                  </Label>
                </div>

                {/* Option: Vendor */}
                <div
                  onClick={() => setContactMode('Vendor')}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                    contactMode === 'Vendor'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value="Vendor" id="contact-mode-vendor" />
                  <Label
                    htmlFor="contact-mode-vendor"
                    className="cursor-pointer text-sm font-bold text-[#0D3B66]"
                  >
                    Vendor
                  </Label>
                </div>
              </RadioGroup>

              {/* Selected Contact Dropdown & Summary Panel */}
              <div className="mt-2 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-bold text-[#0D3B66]">
                    Select Contact Entity
                  </Label>
                  <Select
                    value={selectedContactId}
                    onValueChange={handleContactChange}
                  >
                    <SelectTrigger className="h-10 rounded-md border border-gray-200 text-[#0D3B66] focus:border-primary focus:ring-1 focus:ring-primary">
                      <SelectValue placeholder="Select contact entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {(contactMode === 'Client' && isClientsLoading) ||
                      (contactMode === 'Vendor' && isVendorsLoading) ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : contactsList.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No {contactMode.toLowerCase()}s found
                        </SelectItem>
                      ) : (
                        contactsList.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className={`py-0.2 rounded border-none px-1.5 text-[10px] font-bold ${c.type === 'Client' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}
                              >
                                {c.type}
                              </span>
                              {c.tradeName}{' '}
                              <span className="text-gray-400">
                                ({c.legalName})
                              </span>
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.selectedContactId && (
                    <ErrorBox msg={errors.selectedContactId} />
                  )}
                </div>

                {/* Summary Card */}
                {selectedContact && (
                  <div className="border-gray-150 flex flex-col gap-3 rounded-lg border bg-slate-50/40 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A5ABBD]">
                      Selected Contact
                    </span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-gray-400">
                          Legal Name:
                        </span>
                        <span className="text-sm font-bold text-[#0D3B66]">
                          {selectedContact.legalName}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-gray-400">Type:</span>
                        <div>
                          <span
                            className={`inline-flex items-center rounded border-none bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700`}
                          >
                            {selectedContact.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-gray-400">
                          GSTIN:
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {selectedContact.gstin}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-gray-400">
                          Status:
                        </span>
                        <div>
                          <span className="inline-flex items-center rounded border-none bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {selectedContact.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: MEMBER IDENTITY */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Legal Name */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-bold text-[#0D3B66]">
                    Legal Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="legalName"
                    value={memberIdentity.legalName}
                    onChange={handleInputChange}
                    required
                    className="h-10 rounded-md border border-gray-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  {errors.legalName && <ErrorBox msg={errors.legalName} />}
                </div>

                {/* Trade Name */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-bold text-[#0D3B66]">
                    Trade Name
                  </Label>
                  <Input
                    name="tradeName"
                    value={memberIdentity.tradeName}
                    onChange={handleInputChange}
                    className="h-10 rounded-md border border-gray-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Registered Email */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-bold text-[#0D3B66]">
                    Registered Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={memberIdentity.email}
                    onChange={handleInputChange}
                    required
                    className="h-10 rounded-md border border-gray-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  {errors.email && <ErrorBox msg={errors.email} />}
                </div>

                {/* Registered Phone */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-bold text-[#0D3B66]">
                    Registered Phone
                  </Label>
                  <Input
                    name="phone"
                    value={memberIdentity.phone}
                    onChange={handleInputChange}
                    className="h-10 rounded-md border border-gray-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  {errors.phone && <ErrorBox msg={errors.phone} />}
                </div>
              </div>

              {/* Member Role */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-bold text-[#0D3B66]">
                  Member Roles <span className="text-red-500">*</span>
                </Label>
                <Select value="" onValueChange={handleSelectRole}>
                  <SelectTrigger className="h-10 rounded-md border border-gray-200 text-[#0D3B66] focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder="Select member roles" />
                  </SelectTrigger>
                  <SelectContent className="max-h-28">
                    {optionsForRoles
                      .filter(
                        (opt) => !memberIdentity.roles.includes(opt.value),
                      )
                      .map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    {optionsForRoles.filter(
                      (opt) => !memberIdentity.roles.includes(opt.value),
                    ).length === 0 && (
                      <SelectItem value="none" disabled>
                        All roles selected
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                {/* Display Selected Roles Tags */}
                {memberIdentity.roles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {memberIdentity.roles.map((roleId) => {
                      const roleOpt = optionsForRoles.find(
                        (o) => o.value === roleId,
                      );
                      return (
                        <span
                          key={roleId}
                          className="inline-flex items-center gap-1 rounded bg-[#EDEEF2] px-2.5 py-1 text-xs font-semibold text-gray-800"
                        >
                          {roleOpt?.label || 'Unknown'}
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(roleId)}
                            className="ml-1 text-gray-400 hover:text-gray-600"
                          >
                            &times;
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                {errors.roles && <ErrorBox msg={errors.roles} />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* GSTIN */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-bold text-[#0D3B66]">
                    GSTIN
                  </Label>
                  <Input
                    name="gstin"
                    value={memberIdentity.gstin}
                    onChange={handleInputChange}
                    className="h-10 rounded-md border border-gray-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  {errors.gstin && <ErrorBox msg={errors.gstin} />}
                </div>

                {/* PAN */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-bold text-[#0D3B66]">
                    PAN
                  </Label>
                  <Input
                    name="pan"
                    value={memberIdentity.pan}
                    onChange={handleInputChange}
                    className="h-10 rounded-md border border-gray-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  {errors.pan && <ErrorBox msg={errors.pan} />}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONSENT */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              {/* Informational Message */}
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-xs leading-relaxed text-gray-500">
                <span className="font-semibold text-[#0D3B66]">
                  Member Association Consent
                </span>
                <p className="mt-2 text-gray-500">
                  By completing this step, you authorize the linking of the
                  selected external member to the chosen client or vendor
                  entity. This integration will grant this member the necessary
                  access rights to coordinate and operate within your workspace.
                  Please verify that all information is accurate and that you
                  have the internal authorization to execute this linking.
                </p>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300">
                <Checkbox
                  id="consent-checkbox"
                  checked={consentAccepted}
                  onCheckedChange={handleConsentChange}
                  className="mt-1"
                />
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="consent-checkbox"
                    className="cursor-pointer text-sm font-bold text-[#0D3B66]"
                  >
                    I accept the consent terms and conditions
                  </Label>
                  <span className="text-xs text-gray-500">
                    I confirm that I have verified the member&apos;s identity
                    and authorize this link.
                  </span>
                  {errors.consent && (
                    <ErrorBox msg={errors.consent} className="mt-1" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-4">
          {/* Left Buttons: Cancel (Step 1) or Back (Step 2 & 3) */}
          {step === 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              size="sm"
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          {/* Right Buttons: Continue (Step 1 & 2) or Create Member (Step 3) */}
          {step < 3 ? (
            <Button type="button" onClick={nextStep} size="sm">
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Sending...' : 'Create Member'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
