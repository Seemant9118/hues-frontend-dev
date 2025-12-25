'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSettings } from '@/services/Settings_Services/SettingsService';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AddEWBConfig({
  open,
  onOpenChange,
  refetch,
  editedEWBConfig,
  setEditedEWBConfig,
}) {
  const [showSecret, setShowSecret] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    clientId: '',
    clientSecret: '',
    username: '',
    password: '',
    gstin: '',
    email: '',
  });

  const resetForm = () => {
    setForm({
      clientId: '',
      clientSecret: '',
      username: '',
      password: '',
      gstin: '',
      email: '',
    });
    setShowSecret(false);
    setShowPassword(false);
    setEditedEWBConfig(null);
  };

  useEffect(() => {
    if (!editedEWBConfig) return;

    setForm({
      clientId: editedEWBConfig.clientId || '',
      clientSecret: editedEWBConfig.clientSecret || '',
      username: editedEWBConfig.username || '',
      password: editedEWBConfig.password || '',
      gstin: editedEWBConfig.gstin || '',
      email: editedEWBConfig.email || '',
    });
  }, [editedEWBConfig]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const createSettingMutation = useMutation({
    mutationFn: createSettings,
    onSuccess: () => {
      refetch(); // refetch query
      onOpenChange(false); // close modal
      resetForm();
      toast.success('E-Way Bill configuration saved successfully');
    },
    onError: () => {
      toast.error('Failed to save E-Way Bill configuration');
    },
  });

  const handleSubmit = () => {
    const payload = {
      contextKey: 'EWAYBILL_CREDS',
      settings: Object.entries(form).map(([key, value]) => ({
        key: `ewaybillcreds.${key}`,
        value,
      })),
    };
    createSettingMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-primary">
            {`${editedEWBConfig ? 'Update ' : ''}E-WAY BILL Configuration`}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Securely manage your E-Way Bill credentials. All data is encrypted
            and stored safely.
          </p>
        </DialogHeader>

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          {/* Client ID */}
          <div className="space-y-1">
            <Label>E-Way Bill Client ID</Label>
            <Input
              placeholder="Enter your Client ID"
              value={form.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Provided by the E-Way Bill portal
            </p>
          </div>

          {/* Client Secret */}
          <div className="space-y-1">
            <Label>E-Way Bill Client Secret 🔐</Label>
            <div className="relative">
              <Input
                type={showSecret ? 'text' : 'password'}
                placeholder="Enter your Client Secret"
                value={form.clientSecret}
                onChange={(e) => handleChange('clientSecret', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-2.5 text-muted-foreground"
              >
                👁
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Encrypted and securely stored
            </p>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <Label>E-Way Bill Username</Label>
            <Input
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Provided by the E-Way Bill portal
            </p>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label>E-Way Bill Password 🔒</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground"
              >
                👁
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Never visible to other users
            </p>
          </div>

          {/* GSTIN */}
          <div className="space-y-1">
            <Label>GSTIN</Label>
            <Input
              placeholder="e.g., 27ABCDE1234F2Z5"
              value={form.gstin}
              onChange={(e) => handleChange('gstin', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Used for document generation and compliance
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label>Registered Email ID</Label>
            <Input
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Linked with your E-Way Bill account
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <p className="flex items-center gap-1 text-sm text-green-600">
            🔒 Your credentials are encrypted and can be updated anytime.
          </p>

          <div className="flex gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
