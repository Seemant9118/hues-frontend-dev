/* eslint-disable react/no-array-index-key */
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash } from 'lucide-react';
import React, { useState } from 'react';

const locationRequirementOptions = [
  { value: 'customer', label: 'Customer Location' },
  { value: 'provider', label: 'Provider Office' },
  { value: 'remote', label: 'Remote/Online' },
  { value: 'hybrid', label: 'Hybrid' },
];

const skillLevels = [
  { value: 'L1', label: 'L1 - Basics' },
  { value: 'L2', label: 'L2 - Basics' },
  { value: 'senior', label: 'Senior' },
  { value: 'partner', label: 'Partner-level' },
  { value: 'specialist', label: 'Specialist' },
];

const initialState = {
  roleName: '',
  skillLevel: '',
};

export default function Operations({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const [roles, setRoles] = useState(initialState);

  const rolesRequired = formData?.rolesRequired || [];

  const handleChange = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setRoles((prev) => ({ ...prev, [key]: value }));
  };

  // Remove a role
  const removeRoles = (index) => {
    setFormData((prev) => ({
      ...prev,
      rolesRequired: prev.rolesRequired.filter((_, i) => i !== index),
    }));
  };

  // Add a new role
  const addRoles = () => {
    if (!roles.roleName || !roles.skillLevel) return;

    setFormData((prev) => ({
      ...prev,
      rolesRequired: [...(prev.rolesRequired || []), { ...roles }],
    }));

    // Reset after add
    setRoles(initialState);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ---------------------- RESOURCE REQUIREMENTS ---------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.operations.section1.title') ||
          'Resource Requirements'}
      </h2>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-4">
          {/* Role Name */}
          <div>
            <Label>Role(s) Required</Label>
            <Input
              placeholder="Add role"
              value={roles.roleName}
              onChange={handleChange('roleName')}
            />
            {errors?.roleName && <ErrorBox msg={errors.roleName} />}
          </div>

          {/* Skill Level */}
          <div>
            <Label>Skill Level</Label>
            <Select
              value={roles.skillLevel}
              onValueChange={handleChange('skillLevel')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {skillLevels.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors?.skillLevel && <ErrorBox msg={errors.skillLevel} />}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button size="sm" onClick={addRoles}>
            Add
          </Button>
        </div>
      </div>

      {/* ---------------- ROLES LIST ---------------- */}
      <div className="flex flex-col gap-4">
        {rolesRequired.length > 0 &&
          rolesRequired.map((role, index) => (
            <div
              key={`${role.roleName}-${index}`}
              className="rounded-lg border bg-muted/30 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{role.roleName}</h3>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => removeRoles(index)}
                >
                  <Trash size={16} />
                </Button>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                <p>
                  <span className="font-medium">Skill Level:</span>{' '}
                  {role.skillLevel}
                </p>
              </div>
            </div>
          ))}
      </div>

      {/* ---------------------- LOCATION REQUIREMENTS ---------------------- */}
      <div>
        <Label>Location Requirements</Label>
        <Select
          value={formData?.locationRequirement}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, locationRequirement: v }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {locationRequirementOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors?.locationRequirement && (
          <ErrorBox msg={errors.locationRequirement} />
        )}
      </div>

      {/* ---------------------- CAPACITY ---------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.operations.section2.title') ||
          'Capacity Constraints'}
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Max Services per Day per Resource</Label>
          <Input
            type="number"
            placeholder="e.g., 5"
            value={formData?.maxServicesPerDay}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                maxServicesPerDay: e.target.value,
              }))
            }
          />
          {errors?.maxServicesPerDay && (
            <ErrorBox msg={errors.maxServicesPerDay} />
          )}
        </div>

        <div>
          <Label>Max Parallel Bookings per Slot</Label>
          <Input
            type="number"
            placeholder="e.g., 3"
            value={formData?.maxParallelBookings}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                maxParallelBookings: e.target.value,
              }))
            }
          />
          {errors?.maxParallelBookings && (
            <ErrorBox msg={errors.maxParallelBookings} />
          )}
        </div>
      </div>

      {/* ---------------------- REQUIRED INPUTS ---------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.operations.section3.title') ||
          'Required Inputs'}
      </h2>

      <div>
        <Label>Required Inputs Before Execution</Label>
        <Input
          placeholder="Add required inputs..."
          value={formData?.requiredInput}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              requiredInput: e.target.value,
            }))
          }
        />
        {errors?.requiredInputs && <ErrorBox msg={errors.requiredInputs} />}
      </div>
    </div>
  );
}
