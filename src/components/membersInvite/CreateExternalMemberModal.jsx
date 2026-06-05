'use client';

import { Button } from '@/components/ui/button';
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
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Link2,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Mock Contact Entities
const mockContacts = [
  {
    id: 'meridian',
    tradeName: 'Meridian Finance',
    legalName: 'Meridian Financial Services Ltd.',
    gstin: '27AABCM1234A1Z5',
    pan: 'AABCM1234A',
    email: 'contact@meridianfinance.com',
    phone: '+91 98765 43210',
    type: 'Client',
    status: 'Active',
  },
  {
    id: 'acme',
    tradeName: 'Acme Corp',
    legalName: 'Acme Corporation International',
    gstin: '27AACME4321A1Z0',
    pan: 'AACME4321A',
    email: 'info@acmecorp.com',
    phone: '+91 99887 76655',
    type: 'Vendor',
    status: 'Active',
  },
  {
    id: 'nova',
    tradeName: 'Nova Solutions',
    legalName: 'Nova Tech Solutions LLC',
    gstin: '27AANOVA8888A2Z1',
    pan: 'AANOVA8888A',
    email: 'billing@novasolutions.com',
    phone: '+91 91234 56789',
    type: 'Client',
    status: 'Active',
  },
];

// Mock Artefacts
const mockArtefacts = [
  {
    id: 'audit_2024',
    title: 'Annual Audit Access Agreement 2024',
    description:
      'Access to financial records, ledger views, and client details for annual audit purposes. Includes masked contact information for privacy compliance.',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    permissions: '7 granted',
    signedBy: 'Amit Kumar (Director)',
    status: 'Signed',
  },
  {
    id: 'nda_2025',
    title: 'Vendor Data Protection SLA 2025',
    description:
      'Standard SLA agreement defining system uptime, data encryption standards, and service access bounds for external vendors.',
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    permissions: '4 granted',
    signedBy: 'Rajesh Sharma (VP Engineering)',
    status: 'Signed',
  },
];

export default function CreateExternalMemberModal({
  isOpen,
  setIsOpen,
  onCreate,
}) {
  const [step, setStep] = useState(1);
  const [contactMode, setContactMode] = useState('link'); // 'link' or 'create'
  const [selectedContactId, setSelectedContactId] = useState('meridian');
  const [selectedContact, setSelectedContact] = useState(mockContacts[0]);

  // Form states
  const [memberIdentity, setMemberIdentity] = useState({
    legalName: '',
    tradeName: '',
    email: '',
    phone: '',
    role: '',
    gstin: '',
    pan: '',
  });

  const [selectedArtefactId, setSelectedArtefactId] = useState('');
  const [selectedArtefact, setSelectedArtefact] = useState(null);

  // Sync selected contact details into Member Identity when selected contact changes
  useEffect(() => {
    if (contactMode === 'link' && selectedContact) {
      setMemberIdentity({
        legalName: selectedContact.legalName,
        tradeName: selectedContact.tradeName,
        email: selectedContact.email,
        phone: selectedContact.phone,
        role: memberIdentity.role, // preserve role
        gstin: selectedContact.gstin,
        pan: selectedContact.pan,
      });
    } else if (contactMode === 'create') {
      // Clear fields if creating new
      setMemberIdentity({
        legalName: '',
        tradeName: '',
        email: '',
        phone: '',
        role: memberIdentity.role,
        gstin: '',
        pan: '',
      });
    }
  }, [selectedContact, contactMode]);

  // Handle contact dropdown change
  const handleContactChange = (val) => {
    setSelectedContactId(val);
    const contact = mockContacts.find((c) => c.id === val);
    setSelectedContact(contact);
  };

  // Handle artefact dropdown change
  const handleArtefactChange = (val) => {
    setSelectedArtefactId(val);
    if (val === 'none' || !val) {
      setSelectedArtefact(null);
    } else {
      const art = mockArtefacts.find((a) => a.id === val);
      setSelectedArtefact(art);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMemberIdentity((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectRole = (val) => {
    setMemberIdentity((prev) => ({ ...prev, role: val }));
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (onCreate) {
      onCreate({
        contactMode,
        contact: contactMode === 'link' ? selectedContact : null,
        identity: memberIdentity,
        artefact: selectedArtefact,
      });
    }
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // Reset state on close
          setStep(1);
          setContactMode('link');
          setSelectedContactId('meridian');
          setSelectedContact(mockContacts[0]);
          setSelectedArtefactId('');
          setSelectedArtefact(null);
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10b981] text-white">
                <Check className="h-4 w-4" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#149B8E] text-white">
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10b981] text-white">
                <Check className="h-4 w-4" />
              </div>
            ) : (
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 2 ? 'bg-[#149B8E] text-white' : 'bg-gray-100 text-gray-400'}`}
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
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 3 ? 'bg-[#149B8E] text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              <FileText className="h-4 w-4" />
            </div>
            <span
              className={`text-sm font-bold ${step === 3 ? 'text-[#0D3B66]' : 'text-gray-400'}`}
            >
              Artefact Binding
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div className="navScrollBarStyles max-h-[60vh] min-h-[320px] overflow-y-auto py-6 pr-1">
          {/* STEP 1: LINK CONTACT */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              {/* Option: Link to existing */}
              <div
                onClick={() => setContactMode('link')}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                  contactMode === 'link'
                    ? 'border-[#149B8E] bg-[#149B8E]/5'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  checked={contactMode === 'link'}
                  onChange={() => setContactMode('link')}
                  className="mt-1 h-4 w-4 text-[#149B8E] focus:ring-[#149B8E]"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#0D3B66]">
                    Link to existing Contact Entity
                  </span>
                  <span className="mt-0.5 text-xs text-gray-500">
                    Select from existing Clients or Vendors
                  </span>
                </div>
              </div>

              {/* Option: Create new */}
              <div
                onClick={() => setContactMode('create')}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                  contactMode === 'create'
                    ? 'border-[#149B8E] bg-[#149B8E]/5'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  checked={contactMode === 'create'}
                  onChange={() => setContactMode('create')}
                  className="mt-1 h-4 w-4 text-[#149B8E] focus:ring-[#149B8E]"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#0D3B66]">
                    Create new Contact Entity
                  </span>
                  <span className="mt-0.5 text-xs text-gray-500">
                    Will create a new Client/Vendor record
                  </span>
                </div>
              </div>

              {/* Selected Contact Dropdown & Summary Panel */}
              {contactMode === 'link' && (
                <div className="mt-2 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-bold text-[#0D3B66]">
                      Select Contact Entity
                    </Label>
                    <Select
                      value={selectedContactId}
                      onValueChange={handleContactChange}
                    >
                      <SelectTrigger className="h-10 rounded-md border border-gray-200 text-[#0D3B66] focus:border-[#149B8E] focus:ring-1 focus:ring-[#149B8E]">
                        <SelectValue placeholder="Select contact entity" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockContacts.map((c) => (
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
                        ))}
                      </SelectContent>
                    </Select>
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
                          <span className="text-[11px] text-gray-400">
                            Type:
                          </span>
                          <div>
                            <span className="inline-flex items-center rounded border-none bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
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
                            <span className="inline-flex items-center rounded border-none bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              {selectedContact.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mock fields if 'create' new mode is selected */}
              {contactMode === 'create' && (
                <div className="mt-2 grid grid-cols-2 gap-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4">
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <Label className="text-sm font-bold text-[#0D3B66]">
                      Legal Name *
                    </Label>
                    <Input
                      name="legalName"
                      placeholder="Enter new contact legal name"
                      value={memberIdentity.legalName}
                      onChange={handleInputChange}
                      className="h-10 rounded-md border border-gray-200 bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-bold text-[#0D3B66]">
                      Trade Name
                    </Label>
                    <Input
                      name="tradeName"
                      placeholder="Enter trade name"
                      value={memberIdentity.tradeName}
                      onChange={handleInputChange}
                      className="h-10 rounded-md border border-gray-200 bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-bold text-[#0D3B66]">
                      Type
                    </Label>
                    <Select defaultValue="Client">
                      <SelectTrigger className="h-10 rounded-md border border-gray-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Client">Client</SelectItem>
                        <SelectItem value="Vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: MEMBER IDENTITY */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Legal Name */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-bold text-[#0D3B66]">
                    Legal Name *
                  </Label>
                  <Input
                    name="legalName"
                    value={memberIdentity.legalName}
                    onChange={handleInputChange}
                    required
                    className="h-10 rounded-md border border-gray-200 focus-visible:border-[#149B8E] focus-visible:ring-1 focus-visible:ring-[#149B8E]"
                  />
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
                    className="h-10 rounded-md border border-gray-200 focus-visible:border-[#149B8E] focus-visible:ring-1 focus-visible:ring-[#149B8E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Registered Email */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-bold text-[#0D3B66]">
                    Registered Email *
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={memberIdentity.email}
                    onChange={handleInputChange}
                    required
                    className="h-10 rounded-md border border-gray-200 focus-visible:border-[#149B8E] focus-visible:ring-1 focus-visible:ring-[#149B8E]"
                  />
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
                    className="h-10 rounded-md border border-gray-200 focus-visible:border-[#149B8E] focus-visible:ring-1 focus-visible:ring-[#149B8E]"
                  />
                </div>
              </div>

              {/* Member Role */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-bold text-[#0D3B66]">
                  Member Role *
                </Label>
                <Select
                  value={memberIdentity.role}
                  onValueChange={handleSelectRole}
                  required
                >
                  <SelectTrigger className="h-10 rounded-md border border-gray-200 text-[#0D3B66] focus:border-[#149B8E] focus:ring-1 focus:ring-[#149B8E]">
                    <SelectValue placeholder="Select member role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external_audit">
                      External Auditor
                    </SelectItem>
                    <SelectItem value="vendor_admin">
                      Vendor Administrator
                    </SelectItem>
                    <SelectItem value="client_coordinator">
                      Client Coordinator
                    </SelectItem>
                    <SelectItem value="data_delegate">
                      Data Operations Delegate
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                    className="h-10 rounded-md border border-gray-200 focus-visible:border-[#149B8E] focus-visible:ring-1 focus-visible:ring-[#149B8E]"
                  />
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
                    className="h-10 rounded-md border border-gray-200 focus-visible:border-[#149B8E] focus-visible:ring-1 focus-visible:ring-[#149B8E]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ARTEFACT BINDING */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              {/* Informational Message */}
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-xs leading-relaxed text-gray-500">
                {
                  "Select a signed Consent Artefact to bind to this member. Artefacts define the access permissions granted to this external member's delegates."
                }
                <br />
                <span className="mt-1 block font-semibold">
                  Note: Artefacts are created and signed in the Templates module
                  (out of scope here).
                </span>
              </div>

              {/* Selector */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-bold text-[#0D3B66]">
                  Select Signed Artefact (Optional)
                </Label>
                <Select
                  value={selectedArtefactId}
                  onValueChange={handleArtefactChange}
                >
                  <SelectTrigger className="h-10 rounded-md border border-gray-200 text-[#0D3B66] focus:border-[#149B8E] focus:ring-1 focus:ring-[#149B8E]">
                    <SelectValue placeholder="Choose an artefact..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Choose an artefact...</SelectItem>
                    {mockArtefacts.map((art) => (
                      <SelectItem key={art.id} value={art.id}>
                        <span className="inline-flex items-center gap-2">
                          <span className="py-0.2 rounded bg-[#ecfdf5] px-1.5 text-[10px] font-bold text-[#059669]">
                            {art.status}
                          </span>
                          {art.title}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Details card if artefact is selected */}
              {selectedArtefact && (
                <div className="border-gray-150 flex flex-col gap-4 rounded-lg border bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <span className="text-base font-bold text-[#0D3B66]">
                      {selectedArtefact.title}
                    </span>
                    <span className="rounded border-none bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {selectedArtefact.status}
                    </span>
                  </div>
                  <p className="-mt-2 text-xs leading-relaxed text-gray-500">
                    {selectedArtefact.description}
                  </p>

                  <div className="mt-1 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-gray-400">
                        Valid From:
                      </span>
                      <span className="text-xs font-bold text-gray-700">
                        {selectedArtefact.validFrom}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-gray-400">
                        Valid To:
                      </span>
                      <span className="text-xs font-bold text-gray-700">
                        {selectedArtefact.validTo}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-gray-400">
                        Permissions:
                      </span>
                      <span className="text-xs font-bold text-gray-700">
                        {selectedArtefact.permissions}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-gray-400">
                        Signed By:
                      </span>
                      <span className="text-xs font-bold text-gray-700">
                        {selectedArtefact.signedBy}
                      </span>
                    </div>
                  </div>
                </div>
              )}
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
              className="h-10 rounded-md border border-gray-200 px-5 font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="flex h-10 items-center gap-1.5 rounded-md border border-gray-200 px-5 font-semibold text-gray-600 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          {/* Right Buttons: Continue (Step 1 & 2) or Create Member (Step 3) */}
          {step < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={
                (step === 1 && contactMode === 'link' && !selectedContactId) ||
                (step === 2 &&
                  (!memberIdentity.legalName ||
                    !memberIdentity.email ||
                    !memberIdentity.role))
              }
              className="flex h-10 items-center gap-1.5 rounded-md border-none bg-[#149B8E] px-5 font-semibold text-white hover:bg-[#118176] disabled:opacity-50"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="h-10 rounded-md border-none bg-[#149B8E] px-5 font-semibold text-white hover:bg-[#118176]"
            >
              Create Member
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
