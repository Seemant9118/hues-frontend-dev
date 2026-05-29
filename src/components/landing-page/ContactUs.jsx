'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendMessage } from '@/services/Admin_Services/AdminServices';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Mail, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import ErrorBox from '../ui/ErrorBox';
import Loading from '../ui/Loading';

const GetInTouch = () => {
  const t = useTranslations('landingPage.contact.contactForm');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    mobileNumber: '',
    message: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    message: '',
  });

  const maxMessageLength = 1000;

  const validateField = (name, value) => {
    const trimmedValue = value?.trim();

    switch (name) {
      case 'name':
        return trimmedValue ? '' : t('errors.nameRequired');

      case 'email':
        if (!trimmedValue) return t('errors.emailRequired');
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)
          ? ''
          : t('errors.emailInvalid');

      case 'mobileNumber': {
        if (!trimmedValue) return t('errors.phoneRequired');
        const digits = trimmedValue.replace(/\D/g, '');
        if (digits.length !== 10 && digits.length !== 12)
          return t('errors.phoneInvalid');
        return '';
      }

      case 'message':
        return trimmedValue ? '' : t('errors.messageRequired');

      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      mobileNumber: validateField('mobileNumber', formData.mobileNumber),
      message: validateField('message', formData.message),
    };

    setErrors(newErrors);

    return Object.values(newErrors).every((err) => err === '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // limit message length
    if (name === 'message' && value.length > maxMessageLength) return;

    // allow numbers, spaces, plus, hyphens in mobileNumber
    if (name === 'mobileNumber') {
      updatedValue = value.replace(/[^\d+ -]/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    // live validation on each change
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, updatedValue),
    }));
  };

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      toast.success(t('toast.success'));

      // reset after submit
      setFormData({
        name: '',
        email: '',
        countryCode: '+91',
        mobileNumber: '',
        message: '',
      });

      setErrors({
        name: '',
        email: '',
        mobileNumber: '',
        message: '',
      });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || t('toast.errorFallback'));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    sendMessageMutation.mutate({ data: formData });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        {/* Left Side */}
        <div className="flex flex-col justify-start">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            {t('title.getIn')}
          </h2>
          <div className="mt-4 flex items-center gap-3 text-base text-gray-600">
            <Mail className="h-5 w-5 text-gray-500" />
            <a
              href="mailto:support@paraphernalia.in"
              className="text-gray-700 hover:underline"
            >
              support@paraphernalia.in
            </a>
          </div>
        </div>

        {/* Right Side - Form */}
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                {t('labels.name')}
              </label>
              <Input
                type="text"
                name="name"
                placeholder={t('placeholders.name')}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <ErrorBox msg={errors.name} />}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                {t('labels.email')}
              </label>
              <Input
                type="text"
                name="email"
                placeholder={t('placeholders.email')}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <ErrorBox msg={errors.email} />}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                {t('labels.phone')}
              </label>
              <Input
                type="text"
                name="mobileNumber"
                placeholder={t('placeholders.phone')}
                value={formData.mobileNumber}
                onChange={handleChange}
              />
              {errors.mobileNumber && <ErrorBox msg={errors.mobileNumber} />}
            </div>

            {/* Message */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                {t('labels.message')}
              </label>
              <Textarea
                name="message"
                placeholder={t('placeholders.message')}
                value={formData.message}
                onChange={handleChange}
                rows={5}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.message ? <ErrorBox msg={errors.message} /> : <span />}
                <p className="text-xs text-gray-400">
                  {formData.message.length}/{maxMessageLength}
                </p>
              </div>
            </div>

            {/* Button */}
            <div className="flex justify-start">
              <Button
                type="submit"
                disabled={sendMessageMutation?.isPending}
                className="flex w-40 items-center justify-center gap-2 rounded-sm shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-md"
              >
                {sendMessageMutation?.isPending ? (
                  <Loading />
                ) : (
                  <>
                    <Send size={14} />
                    <span>{t('button.sendMessage')}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GetInTouch;
