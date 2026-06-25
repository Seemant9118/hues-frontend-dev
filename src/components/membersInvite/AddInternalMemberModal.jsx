'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import ErrorBox from '@/components/ui/ErrorBox';
import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ReactSelect from 'react-select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import { rolesApi } from '@/api/rolesApi/rolesApi';
import { templateBuilderApi } from '@/api/template-builder/template_builder_api';
import {
  convertSnakeToTitleCase,
  getEnterpriseId,
} from '@/appUtils/helperFunctions';
import {
  createAssociateMembers,
  updateAssociateMember,
} from '@/services/Associate_Members_Services/AssociateMembersServices';
import { getRoles } from '@/services/Roles_Services/Roles_Services';
import { getTemplates } from '@/services/template-builder/TemplateBuilderServices';
import { toast } from 'sonner';
import moment from 'moment';

export default function AddInternalMemberModal({
  isOpen,
  setIsOpen,
  membersInfo = null,
  isEditMode = false,
}) {
  const enterpriseId = getEnterpriseId();
  const queryClient = useQueryClient();
  const [optionsForRoles, setOptionsForRoles] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    roles: [],
    designation: '',
    department: '',
    employeeCode: '',
    dateOfJoining: '',
    agreement: 'none',
    status: true,
  });

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Invalid email format';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanedPhone = formData.phone.trim().replace(/[\s-]/g, '');
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(cleanedPhone)) {
        newErrors.phone = 'Invalid phone number format (must be 10-15 digits)';
      }
    }

    if (!formData.roles || formData.roles.length === 0) {
      newErrors.roles = 'Please select at least one role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Load actual roles list from query
  const { data: rolesList } = useQuery({
    queryKey: [rolesApi.getAllRoles.endpointKey],
    queryFn: getRoles,
    select: (data) => data.data.data,
    enabled: !!isOpen,
  });

  // Load templates list from query
  const { data: templatesList } = useQuery({
    queryKey: [
      templateBuilderApi.getTemplates.endpointKey,
      enterpriseId,
      'MEMBERS',
    ],
    queryFn: () =>
      getTemplates({ enterpriseId, type: 'MEMBERS', isPublished: true }),
    select: (data) => data?.data?.data || [],
    enabled: !!isOpen && !!enterpriseId,
  });

  useEffect(() => {
    if (!rolesList) return;
    const options = rolesList?.map((role) => ({
      value: role?.id,
      label: convertSnakeToTitleCase(role?.name),
    }));
    setOptionsForRoles(options);
  }, [rolesList]);

  // Sync data when entering edit mode or membersInfo changes
  useEffect(() => {
    setErrors({});
    if (isEditMode && membersInfo) {
      setFormData({
        fullName: membersInfo.invitation?.userDetails?.name || '',
        email: membersInfo.invitation?.userDetails?.email || '',
        phone: membersInfo.invitation?.userDetails?.mobileNumber || '',
        roles: membersInfo.roles?.map((role) => role.roleId) || [],
        designation: membersInfo.designation || '',
        department: membersInfo.department || '',
        employeeCode: membersInfo.employeeCode || '',
        dateOfJoining: membersInfo.dateOfJoining
          ? moment(membersInfo.dateOfJoining).format('YYYY-MM-DD')
          : '',
        agreement: membersInfo.agreement || 'none',
        status: membersInfo.isActive ?? true,
      });
    } else {
      // Reset form when opening to create
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        roles: [],
        designation: '',
        department: '',
        employeeCode: '',
        dateOfJoining: '',
        agreement: 'none',
        status: true,
      });
    }
  }, [membersInfo, isEditMode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, status: checked }));
  };

  const createMemberMutation = useMutation({
    mutationKey: [associateMemberApi.createAssociateMembers.endpointKey],
    mutationFn: createAssociateMembers,
    onSuccess: () => {
      toast.success('Internal Member added successfully!');
      queryClient.invalidateQueries([
        associateMemberApi.getAllAssociateMembers.endpointKey,
        enterpriseId,
      ]);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to add internal member',
      );
    },
  });

  const updateMemberMutation = useMutation({
    mutationKey: [associateMemberApi.updateAssociateMember.endpointKey],
    mutationFn: updateAssociateMember,
    onSuccess: () => {
      toast.success('Internal Member updated successfully!');
      queryClient.invalidateQueries([
        associateMemberApi.getAllAssociateMembers.endpointKey,
        enterpriseId,
      ]);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update member');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      name: formData.fullName,
      countryCode: '+91',
      mobileNumber: formData.phone,
      email: formData.email,
      enterpriseId,
      rolesIds: formData.roles,
      designation: formData.designation,
      department: formData.department,
      employeeCode: formData.employeeCode,
      dateOfJoining: formData.dateOfJoining || null,
      isActive: formData.status,
      agreementTemplateId:
        formData.agreement !== 'none' ? Number(formData.agreement) : null,
    };

    if (isEditMode && membersInfo?.id) {
      updateMemberMutation.mutate({
        id: membersInfo.id,
        data: payload,
      });
    } else {
      createMemberMutation.mutate(payload);
    }
  };

  const isPending =
    createMemberMutation.isPending || updateMemberMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="flex max-h-[90vh] max-w-[700px] flex-col gap-0 overflow-hidden rounded-lg border border-gray-100 bg-white p-0 shadow-xl">
        {/* Sticky Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-[#0D3B66]">
            {isEditMode ? 'Edit Internal Member' : 'Add Internal Member'}
          </DialogTitle>
        </div>

        {/* Scrollable Form Content */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="navScrollBarStyles flex-1 space-y-6 overflow-y-auto p-6 px-6 pt-4">
            {/* PROFILE SECTION */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A5ABBD]">
                PROFILE
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <Label>
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="fullName"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                  {errors.fullName && <ErrorBox msg={errors.fullName} />}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <Label>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <ErrorBox msg={errors.email} />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <Label>
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="phone"
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  {errors.phone && <ErrorBox msg={errors.phone} />}
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <Label>
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <ReactSelect
                    isMulti
                    name="roles"
                    placeholder="Select role"
                    options={optionsForRoles}
                    className="text-sm"
                    classNamePrefix="select"
                    value={optionsForRoles?.filter((option) =>
                      formData.roles?.includes(option.value),
                    )}
                    onChange={(selectedOptions) => {
                      const selectedRoles = selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : [];
                      setFormData((prev) => ({
                        ...prev,
                        roles: selectedRoles,
                      }));
                      if (errors.roles) {
                        setErrors((prev) => ({ ...prev, roles: '' }));
                      }
                    }}
                  />
                  {errors.roles && <ErrorBox msg={errors.roles} />}
                </div>
              </div>
            </div>

            {/* ORGANIZATION SECTION */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A5ABBD]">
                ORGANIZATION
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Designation */}
                <div className="flex flex-col gap-1.5">
                  <Label>Designation</Label>
                  <Input
                    name="designation"
                    placeholder="e.g., Senior Manager"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>

                {/* Department */}
                <div className="flex flex-col gap-1.5">
                  <Label>Department</Label>
                  <Input
                    name="department"
                    placeholder="e.g., Finance"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Employee Code */}
                <div className="flex flex-col gap-1.5">
                  <Label>Employee Code</Label>
                  <Input
                    name="employeeCode"
                    placeholder="e.g., HUE-005"
                    value={formData.employeeCode}
                    onChange={handleChange}
                  />
                </div>

                {/* Joining Date */}
                <div className="flex flex-col gap-1.5">
                  <Label>Joining Date</Label>
                  <div className="relative flex h-10 items-center rounded-md border border-gray-200 bg-white px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <Calendar className="mr-2 h-4 w-4 text-[#A5ABBD]" />
                    <input
                      type="date"
                      name="dateOfJoining"
                      value={formData.dateOfJoining}
                      onChange={handleChange}
                      style={{ colorScheme: 'light' }}
                      className="w-full cursor-pointer bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* INTERNAL ARTEFACT SECTION */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A5ABBD]">
                INTERNAL ARTEFACT (OPTIONAL)
              </h3>
              <div className="flex flex-col gap-1.5">
                <Label>Select Signed Agreement from Templates</Label>
                <Select
                  value={
                    formData.agreement ? String(formData.agreement) : 'none'
                  }
                  onValueChange={(val) => handleSelectChange('agreement', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {templatesList?.map((template) => (
                      <SelectItem key={template.id} value={String(template.id)}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* STATUS TOGGLE */}
            <div className="flex items-center justify-between border-b border-t border-gray-100 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-[#0D3B66]">Status</span>
                <span className="text-xs text-[#A5ABBD]">
                  Set member as active or inactive
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#0D3B66]">
                  {formData.status ? 'Active' : 'Inactive'}
                </span>
                <Switch
                  checked={formData.status}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-white p-6 pt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isEditMode ? 'Update Member' : 'Add Internal Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
