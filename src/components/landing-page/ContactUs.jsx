'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendMessage } from '@/services/Admin_Services/AdminServices';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
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

      case 'mobileNumber':
        if (!trimmedValue) return t('errors.phoneRequired');
        if (trimmedValue.length !== 10) return t('errors.phoneInvalid');
        return '';

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

    // allow only numbers in mobileNumber
    if (name === 'mobileNumber') {
      updatedValue = value.replace(/\D/g, '');
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
    <div className="mx-auto max-w-6xl">
      {/* Heading */}
      <div className="px-6 pt-20 text-center sm:mx-10">
        <h2 className="text-xl font-semibold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
          {t('title.getIn')}{' '}
          <span className="inline-block font-handwriting text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
            {t('title.touch')}
          </span>
        </h2>

        <p className="mt-2 text-gray-600">
          {t('emailLabel')}{' '}
          <a
            href="mailto:support@paraphernalia.in"
            className="text-primary hover:underline"
          >
            support@paraphernalia.in
          </a>
        </p>
      </div>

      {/* Form Wrapper */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-lg md:p-10">
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          {/* Left Side */}
          <div className="flex flex-col gap-6">
            {/* Name */}
            <div>
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
              <div className="relative flex items-center">
                <span className="absolute left-2 text-sm text-gray-600">
                  {formData.countryCode}
                </span>

                <Input
                  type="text"
                  name="mobileNumber"
                  placeholder={t('placeholders.phone')}
                  className="w-full py-2 pl-10 pr-3"
                  value={formData.mobileNumber}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, '');
                    handleChange({
                      target: { name: 'mobileNumber', value: onlyNumbers },
                    });
                  }}
                />
              </div>

              {errors.mobileNumber && <ErrorBox msg={errors.mobileNumber} />}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col">
            <Textarea
              name="message"
              placeholder={t('placeholders.message')}
              value={formData.message}
              onChange={handleChange}
              rows={7}
            />

            <div className="mt-2 flex items-center justify-between">
              {errors.message ? <ErrorBox msg={errors.message} /> : <span />}

              <p className="text-sm text-gray-500">
                {formData.message.length}/{maxMessageLength}
              </p>
            </div>
          </div>

          {/* Button */}
          <div className="mt-4 flex justify-center md:col-span-2">
            <Button
              type="submit"
              size="sm"
              className="px-10 py-3 font-semibold text-white shadow-sm transition"
              disabled={sendMessageMutation?.isPending}
            >
              {sendMessageMutation?.isPending ? (
                <Loading />
              ) : (
                t('button.sendMessage')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GetInTouch;
