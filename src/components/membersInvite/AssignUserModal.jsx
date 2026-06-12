'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import ErrorBox from '@/components/ui/ErrorBox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import {
  convertSnakeToTitleCase,
  getEnterpriseId,
} from '@/appUtils/helperFunctions';
import {
  getAllAssociateMembers,
  addMember,
  updateExternalMemberRoles,
} from '@/services/Associate_Members_Services/AssociateMembersServices';
import { toast } from 'sonner';

export default function AssignUserModal({
  isOpen,
  setIsOpen,
  memberId,
  memberDetails = null,
  editUser = null,
  isEditMode = false,
}) {
  const enterpriseId = getEnterpriseId();
  const queryClient = useQueryClient();
  const [optionsForMembers, setOptionsForMembers] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    userId: '',
    roles: [],
  });

  // Load enterprise members list
  const { data: membersList } = useQuery({
    queryKey: [
      associateMemberApi.getAllAssociateMembers.endpointKey,
      enterpriseId,
    ],
    queryFn: () => getAllAssociateMembers(enterpriseId, 'INTERNAL', 'ACCEPTED'),
    select: (res) => res?.data?.data || [],
    enabled: !!isOpen && !!enterpriseId,
  });

  // Compute role options based on external member's roles
  const optionsForRoles = React.useMemo(() => {
    const rolesSource = memberDetails?.roles || [];
    return rolesSource.map((role) => ({
      value: role?.roleId || role?.id,
      label: convertSnakeToTitleCase(role?.name),
    }));
  }, [memberDetails]);

  useEffect(() => {
    if (!membersList) return;
    const options = membersList.map((m) => {
      const name = m.name || m.invitation?.userDetails?.name || 'Unnamed';
      const email = m.email || m.invitation?.userDetails?.email || '';
      return {
        value: m.userId,
        label: email ? `${name} (${email})` : name,
      };
    });
    setOptionsForMembers(options);
  }, [membersList]);

  // Populate data when opening/closing or changing edit mode
  useEffect(() => {
    setErrors({});
    if (isEditMode && editUser) {
      setFormData({
        userId: String(editUser.userId || editUser.id || ''),
        roles:
          editUser.rolesAssigned
            ?.map((r) => r.roleId || r.id)
            .filter(Boolean) || [],
      });
    } else {
      setFormData({
        userId: '',
        roles: [],
      });
    }
  }, [editUser, isEditMode, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!formData.userId) {
      newErrors.userId = 'Please select a member';
    }

    if (!formData.roles || formData.roles.length === 0) {
      newErrors.roles = 'Please select at least one role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addMutation = useMutation({
    mutationKey: [associateMemberApi.addMember.endpointKey],
    mutationFn: addMember,
    onSuccess: () => {
      toast.success('User assigned successfully!');
      queryClient.invalidateQueries([
        associateMemberApi.getMember.endpointKey,
        memberId,
      ]);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign user');
    },
  });

  const updateMutation = useMutation({
    mutationKey: [associateMemberApi.updateExternalMemberRoles.endpointKey],
    mutationFn: updateExternalMemberRoles,
    onSuccess: () => {
      toast.success('Assigned user roles updated successfully!');
      queryClient.invalidateQueries([
        associateMemberApi.getMember.endpointKey,
        memberId,
      ]);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to update user roles',
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (isEditMode && editUser) {
      const payload = {
        enterpriseUserId: Number(memberId),
        roleIds: formData.roles,
        userAccountId: Number(editUser.userAccountId),
      };
      updateMutation.mutate(payload);
    } else {
      const payload = {
        hostEnterpriseId: memberDetails?.enterpriseId?.id || null,
        sourceEnterpriseId: memberDetails?.sourceEnterpriseId?.id || null,
        userId: Number(formData.userId),
        roleIds: formData.roles,
        accEnterpriseUserId: Number(memberId),
      };
      addMutation.mutate(payload);
    }
  };

  const handleSelectRole = (roleIdVal) => {
    const roleId = Number(roleIdVal);
    if (!formData.roles.includes(roleId)) {
      setFormData((prev) => ({
        ...prev,
        roles: [...prev.roles, roleId],
      }));
      if (errors.roles) {
        setErrors((prev) => ({ ...prev, roles: '' }));
      }
    }
  };

  const handleRemoveRole = (roleId) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.filter((id) => id !== roleId),
    }));
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="flex max-w-[500px] flex-col gap-0 overflow-hidden rounded-lg border border-gray-100 bg-white p-0 shadow-xl">
        {/* Sticky Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-[#0D3B66]">
            {isEditMode ? 'Edit Assigned User Roles' : 'Assign User'}
          </DialogTitle>
        </div>

        {/* Scrollable Form Content */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="navScrollBarStyles flex-1 space-y-6 overflow-y-auto p-6 px-6 pt-4">
            <div className="flex flex-col gap-5">
              {/* Select Member */}
              <div className="flex flex-col gap-1.5">
                <Label>
                  Select Member <span className="text-red-500">*</span>
                </Label>
                {isEditMode ? (
                  <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    {editUser?.name || editUser?.email || 'Assigned User'}
                  </div>
                ) : (
                  <Select
                    value={formData.userId ? String(formData.userId) : ''}
                    onValueChange={(val) => {
                      setFormData((prev) => ({
                        ...prev,
                        userId: val,
                      }));
                      if (errors.userId) {
                        setErrors((prev) => ({ ...prev, userId: '' }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent className="max-h-28">
                      {optionsForMembers.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={String(option.value)}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                      {optionsForMembers.length === 0 && (
                        <SelectItem value="none" disabled>
                          No members found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
                {errors.userId && <ErrorBox msg={errors.userId} />}
              </div>

              {/* Roles */}
              <div className="flex flex-col gap-1.5">
                <Label>
                  Roles <span className="text-red-500">*</span>
                </Label>
                <Select value="" onValueChange={handleSelectRole}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Select roles" />
                  </SelectTrigger>
                  <SelectContent className="max-h-28">
                    {optionsForRoles
                      .filter((opt) => !formData.roles.includes(opt.value))
                      .map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    {optionsForRoles.filter(
                      (opt) => !formData.roles.includes(opt.value),
                    ).length === 0 && (
                      <SelectItem value="none" disabled>
                        All roles selected
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                {/* Display Selected Roles Tags */}
                {formData.roles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {formData.roles.map((roleId) => {
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
            </div>
          </div>

          {/* Sticky Footer - Aligned Bottom Left */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-white p-6 pt-4">
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
