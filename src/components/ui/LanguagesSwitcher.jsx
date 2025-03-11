'use client';

import { getStylesForSelectComponent } from '@/appUtils/helperFunctions';
import { useUser } from '@/context/UserContext';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import Select from 'react-select';
import { Label } from './label';

const LanguagesSwitcher = ({ translations }) => {
  const { setLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname(); // Get current route path

  const optionsOfLanguages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
  ];

  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1]; // Get the first part of the path
  const selectedLanguage =
    optionsOfLanguages.find((opt) => opt.value === currentLocale) ||
    optionsOfLanguages[0];

  const handleChange = (selectedOption) => {
    const newLocale = selectedOption.value;
    const currentPathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, ''); // Remove existing locale prefix

    setLoading(true);
    router.replace(`/${newLocale}${currentPathWithoutLocale}`);
  };

  return (
    <div className="flex h-full flex-col p-2">
      <div className="flex flex-col gap-2">
        <Label className="flex gap-1">
          {translations('tabs.content.tab3.label.select')}
        </Label>
        <div className="flex w-full flex-col gap-1">
          <Select
            name="language"
            options={optionsOfLanguages}
            styles={getStylesForSelectComponent()}
            className="max-w-xs text-sm"
            classNamePrefix="select"
            value={selectedLanguage} // Maintain selected value
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default LanguagesSwitcher;
