import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPIs } from '@/api/adminApi/AdminApi';
import { addUser, updateUser } from '@/services/Admin_Services/AdminServices';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const AddUsers = ({
  isModalOpen,
  setIsModalOpen,
  edittedData,
  setEdditedData,
  enterpriseId,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    enterpriseId: Number(enterpriseId),
    name: '',
    email: '',
    mobileNumber: '',
    panNumber: '',
    aadharNumber: '',
    dateOfBirth: '',
    isOnboardingCompleted: false,
    isDirector: false,
  });

  const resetForm = () => {
    setFormData({
      enterpriseId: Number(enterpriseId),
      name: '',
      email: '',
      mobileNumber: '',
      panNumber: '',
      aadharNumber: '',
      dateOfBirth: '',
      isOnboardingCompleted: false,
      isDirector: false,
    });
  };

  useEffect(() => {
    if (isModalOpen && edittedData) {
      // Populate form for editing
      setFormData({
        enterpriseId: Number(enterpriseId),
        name: edittedData?.name || '',
        email: edittedData?.email || '',
        mobileNumber: edittedData?.mobilenumber || '',
        panNumber: edittedData?.pannumber || '',
        aadharNumber: edittedData?.aadhaarnumber || '',
        dateOfBirth: edittedData?.dateofbirth || '',
        isOnboardingCompleted: edittedData?.isonboardingcomplete || false,
        isDirector: edittedData?.isdirector || false,
      });
    } else if (isModalOpen && !edittedData) {
      // Reset form for adding new user
      resetForm();
    }
  }, [isModalOpen, edittedData, enterpriseId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addUserMutation = useMutation({
    mutationKey: [AdminAPIs.addUser.endpointKey],
    mutationFn: (data) => addUser(data),
    onSuccess: () => {
      toast.success('User added for enterprise');
      resetForm();
      setIsModalOpen(false);
      // Clear edited data
      if (setEdditedData) {
        setEdditedData(null);
      }
      queryClient.invalidateQueries([
        AdminAPIs.getEnterpriseDetails.endpointKey,
      ]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const updateUserMutation = useMutation({
    mutationKey: [AdminAPIs.updateUser.endpointKey],
    mutationFn: (data) => updateUser(data),
    onSuccess: () => {
      toast.success('User updated successfully');
      resetForm();
      setIsModalOpen(false);
      // Clear edited data
      if (setEdditedData) {
        setEdditedData(null);
      }
      queryClient.invalidateQueries([
        AdminAPIs.getEnterpriseDetails.endpointKey,
      ]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = () => {
    if (edittedData) {
      // Update existing user
      updateUserMutation.mutate({
        ...formData,
        userId: edittedData?.useid,
        userAccountId: edittedData?.useraccountid,
      });
    } else {
      // Add new user
      addUserMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsModalOpen(false);
    // Clear edited data
    if (setEdditedData) {
      setEdditedData(null);
    }
  };

  const isLoading = addUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{edittedData ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {edittedData
              ? 'Update the user details below.'
              : 'Fill in the user details below to add a new user to the system.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <section className="scrollBarStyles flex max-h-[350px] flex-col gap-2 overflow-auto border-b px-2">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Mobile Field */}
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
                disabled={isLoading}
              />
            </div>

            {/* PAN Field */}
            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleInputChange}
                placeholder="ABCDE1234F"
                maxLength={10}
                disabled={isLoading}
              />
            </div>

            {/* AADHAR Field */}
            <div className="space-y-2">
              <Label htmlFor="aadharNumber">Aadhar Number</Label>
              <Input
                id="aadharNumber"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleInputChange}
                placeholder="12 - Digit Aadhar number"
                maxLength={12}
                disabled={isLoading}
              />
            </div>

            {/* DOB Field */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            {/* IsOnboardingCompleted Field */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="isOnboardingCompleted"
                checked={formData.isOnboardingCompleted}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isOnboardingCompleted: checked,
                  }))
                }
                disabled={isLoading}
              />
              <Label htmlFor="isOnboardingCompleted">
                Is Onboarding Completed
              </Label>
            </div>

            {/* IsDirector Field */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="isDirector"
                checked={formData.isDirector}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isDirector: checked }))
                }
                disabled={isLoading}
              />
              <Label htmlFor="isDirector">Is Director</Label>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading
                ? edittedData
                  ? 'Updating...'
                  : 'Adding...'
                : edittedData
                  ? 'Update'
                  : 'Add'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUsers;
