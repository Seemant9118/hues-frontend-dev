'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendMessage } from '@/services/Admin_Services/AdminServices';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import ErrorBox from '../ui/ErrorBox';
import Loading from '../ui/Loading';

const GetInTouch = () => {
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
        return trimmedValue ? '' : 'Name is required';

      case 'email':
        if (!trimmedValue) return 'Email is required';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)
          ? ''
          : 'Please enter a valid email';

      case 'mobileNumber':
        if (!trimmedValue) return 'Phone number is required';
        if (trimmedValue.length !== 10)
          return 'Please enter a 10 - digit mobileNumber number';
        return '';

      case 'message':
        return trimmedValue ? '' : 'Message is required';

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
      toast.success(`Message Send Successfully`);
      // reset after submit
      setFormData({
        name: '',
        email: '',
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
      toast.error(
        error.response.data.message ||
          'We hit a snag! Please refresh or retry shortly',
      );
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    sendMessageMutation.mutate({ data: formData });
  };

  return (
    <section className="w-full px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="relative inline-block text-gray-900">
            <span className="text-xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl">
              GET IN
            </span>
            <span className="lg:text-6x ml-2 font-handwriting text-2xl text-gray-700 sm:text-4xl md:text-5xl">
              TOUCH
            </span>
          </p>

          <p className="mt-4 text-gray-600">
            Email:{' '}
            <a
              href="mailto:support@hues.com"
              className="text-primary hover:underline"
            >
              support@hues.com
            </a>
          </p>
        </div>

        {/* Form Wrapper */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg md:p-10">
          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            {/* Left Side */}
            <div className="flex flex-col gap-6">
              {/* Name */}
              <div>
                <Input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <ErrorBox msg={errors.name} />}
              </div>

              {/* Email (Optional) */}
              <div>
                <Input
                  type="text"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <ErrorBox msg={errors.email} />}
              </div>

              {/* Phone */}
              <div>
                <div className="relative flex items-center">
                  <span className="absolute left-2 text-sm text-gray-600">
                    +91
                  </span>
                  <Input
                    type="text"
                    name="mobileNumber"
                    placeholder="Your phone"
                    className="w-full py-2 pl-10 pr-3"
                    value={formData.mobileNumber}
                    onChange={(e) => {
                      // ✅ allow only numbers
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
                placeholder="Your message"
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
                {sendMessageMutation?.isPending ? <Loading /> : `Send Message`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default GetInTouch;
