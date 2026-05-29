'use client';

import {
  getStylesForSelectComponent,
  parseJwt,
} from '@/appUtils/helperFunctions';
import { goToHomePage } from '@/appUtils/redirectionUtilFn';
import GetInTouch from '@/components/landing-page/ContactUs';
import ScrollReveal from '@/components/landing-page/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { LocalStorageService } from '@/lib/utils';
import {
  BarChart3,
  Globe,
  Lock,
  Mail,
  Menu,
  Scale,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import '../globals.css';

const features = [
  {
    key: 'verifiedOnboarding',
    icon: (
      <Image
        src="/Identity.png"
        width={70}
        height={70}
        alt="Chart Icon"
        className="transition-transform duration-500 group-hover:scale-110"
      />
    ),
  },
  {
    key: 'alwaysAuditReady',
    icon: (
      <Image
        src="/Data.png"
        width={70}
        height={70}
        alt="Chart Icon"
        className="transition-transform duration-500 group-hover:scale-110"
      />
    ),
  },
  {
    key: 'aiAtEveryStep',
    icon: (
      <Image
        src="/Business.png"
        width={70}
        height={70}
        alt="Chart Icon"
        className="transition-transform duration-500 group-hover:scale-110"
      />
    ),
  },
];

const features1 = [
  {
    key: 'vendorManagement',
    icon: <Users className="h-6 w-6" />,
  },
  {
    key: 'salesPurchaseAutomation',
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    key: 'taxLegalCompliance',
    icon: <Scale className="h-6 w-6" />,
  },
  {
    key: 'builtInBiTools',
    icon: <BarChart3 className="h-6 w-6" />,
  },
];

const features2 = [
  {
    key: 'corporatesMsme',
    icon: (
      <Image
        src="/Identity.png"
        width={70}
        height={70}
        alt="Chart Icon"
        className="transition-transform duration-500 group-hover:scale-110"
      />
    ),
  },
  {
    key: 'auditorsInvestors',
    icon: (
      <Image
        src="/Identity.png"
        width={70}
        height={70}
        alt="Chart Icon"
        className="transition-transform duration-500 group-hover:scale-110"
      />
    ),
  },
];

export default function HeroSection() {
  const pathname = usePathname(); // Get current route path
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const t = useTranslations('landingPage');

  useEffect(() => {
    try {
      const token = LocalStorageService.get('token');

      if (!token) return;

      const userData = parseJwt(token);

      if (userData?.userId) {
        window.location.href = goToHomePage();
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('JWT parse failed:', err);
    }
  }, []);

  const optionsOfLanguages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिन्दी' },
  ];

  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1]; // Get the first part of the path
  const selectedLanguage =
    optionsOfLanguages.find((opt) => opt.value === currentLocale) ||
    optionsOfLanguages[0];

  const handleChange = (selectedOption) => {
    const newLocale = selectedOption.value;

    // Set the cookie manually (expires in 1 year)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;

    const currentPathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    setIsLoading(true);
    // Force a full page reload to ensure server picks up cookie
    window.location.href = `/${newLocale}${currentPathWithoutLocale}`;
  };

  // if browser loading then show this
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <Image
          src={'/hues_logo.png'}
          height={40}
          width={100}
          placeholder="blur"
          alt="Logo"
          blurDataURL="/hues_logo.png"
        />
        <div>Loading...</div>
      </div>
    );
  }
  return (
    <div className="relative min-h-screen w-full bg-gradient-bg">
      {/* Top Navigation */}
      <div className="sticky top-0 z-20 flex justify-center px-4 py-4">
        <nav className="sticky top-0 z-20 mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-4 rounded-md border bg-white/70 px-4 py-3 backdrop-blur-sm">
          {/* Logo */}
          <Link href="/" aria-label="Go to homepage">
            <Image
              src="/hues_logo.png"
              width={100}
              height={30}
              alt="HUES Logo"
            />
          </Link>

          {/* Hamburger (shown on small screens) */}
          <div className="md:hidden">
            <Button
              variant="outline"
              debounceTime={0}
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Desktop Nav */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList className="flex items-center gap-6 text-sm font-medium text-black">
              <NavigationMenuItem>
                <Link
                  href="#contact"
                  className="transition-colors duration-200 hover:text-[#EA5868]"
                >
                  {t('nav.contactUs')}
                </Link>
              </NavigationMenuItem>
              <Button
                size="sm"
                className="transition-all duration-300 hover:scale-105 hover:shadow-sm"
                onClick={() => router.push('/login')}
              >
                {t('nav.register')}
              </Button>
              <Select
                name="language"
                options={optionsOfLanguages}
                styles={getStylesForSelectComponent()}
                className="rounded-[9px] text-sm font-semibold"
                classNamePrefix="select"
                value={selectedLanguage} // Maintain selected value
                onChange={handleChange}
              />
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="absolute left-0 top-full z-10 w-full rounded-md border bg-white px-4 py-4 shadow-md md:hidden">
              <ul className="flex flex-col gap-4 text-sm font-medium text-black">
                <li>
                  <Link href="#contact" onClick={() => setIsOpen(false)}>
                    {t('nav.contactUs')}
                  </Link>
                </li>
                <li>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => router.push('/login')}
                  >
                    {t('nav.register')}
                  </Button>
                </li>
                <li>
                  <Select
                    name="language"
                    options={optionsOfLanguages}
                    styles={getStylesForSelectComponent()}
                    className="rounded-[9px] text-sm font-semibold"
                    classNamePrefix="select"
                    value={selectedLanguage} // Maintain selected value
                    onChange={handleChange}
                  />
                </li>
              </ul>
            </div>
          )}
        </nav>
      </div>

      {/* hero */}
      <section>
        {/* Hero Content */}
        <section className="relative mx-auto mt-12 flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
          <Image
            src="/Identity.png"
            width={60}
            height={60}
            alt="Chart Icon"
            className="animate-float-slow absolute left-1 top-4 hidden sm:block"
          />
          <Image
            src="/Data.png"
            width={60}
            height={60}
            alt="People Icon"
            className="animate-float-medium absolute bottom-12 left-4 hidden sm:block"
          />
          <Image
            src="/Business.png"
            width={60}
            height={60}
            alt="Bag Icon"
            className="animate-float-fast absolute right-2 top-20 hidden sm:block"
          />

          {/* Badge */}
          <ScrollReveal delay={100} animation="slide-up">
            <p className="mb-4 rounded-full bg-[#F8BA0530] px-4 py-1 text-xs font-semibold text-[#B68800] sm:text-sm">
              {t('badge.verified')}
            </p>
          </ScrollReveal>

          {/* Hero Heading */}
          <ScrollReveal delay={250} animation="slide-up">
            <h1 className="font-bold leading-tight text-[#1A1A1A] sm:text-5xl md:text-7xl">
              {t('hero.title.redefining')}{' '}
              <span className="mb-5 inline-block rotate-[-2deg] font-handwriting text-[#EA5868] sm:text-6xl md:text-8xl">
                {t('hero.title.erp')}
              </span>{' '}
              {t('hero.title.for')} <span>{t('hero.title.digitalBharat')}</span>
            </h1>
          </ScrollReveal>

          {/* Subtext */}
          <ScrollReveal delay={400} animation="slide-up">
            <p className="mt-4 max-w-2xl font-semibold text-gray-600 md:text-base">
              {t('hero.description')}
            </p>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={550} animation="slide-up">
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
              <Button
                className="w-40 rounded-sm transition-transform duration-300 hover:scale-105 hover:shadow-md"
                onClick={() => router.push('#contact')}
              >
                {t('hero.cta.tryForFree')}
              </Button>
            </div>
          </ScrollReveal>
        </section>

        {/* Dashboard Preview Image */}
        <ScrollReveal delay={300} animation="scale-up" duration={800}>
          <figure className="mt-10 flex justify-center px-2">
            <Image
              src="/hero-image.png"
              width={800}
              height={500}
              alt={t('hero.imageAlt')}
              unoptimized
              className="w-full max-w-4xl rounded-t-xl border border-gray-100 bg-white p-2"
            />
          </figure>
        </ScrollReveal>
      </section>

      {/* why? */}
      <section className="bg-white px-4 py-20 md:px-20">
        <ScrollReveal animation="slide-up">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {t('whyChoose.title.why')}{' '}
              <span className="mt-2 font-handwriting text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
                {t('whyChoose.title.choose')}
              </span>{' '}
              {t('whyChoose.title.hues')}
            </h2>
            <p className="mt-4 text-base text-gray-600">
              {t('whyChoose.subtitle')}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features?.map((feature, index) => (
            <ScrollReveal
              key={feature?.key}
              animation="slide-up"
              delay={index * 150}
            >
              <Card className="group flex h-full cursor-pointer flex-col items-start gap-4 rounded-xl border border-gray-200 px-6 py-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#288af9]/20 hover:shadow-lg">
                {feature?.icon}
                <CardContent className="p-0">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t(`whyChoose.features.${feature.key}.title`)}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {t(`whyChoose.features.${feature.key}.description`)}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* its governed */}
      <section className="w-full px-4 py-20 md:px-20">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal animation="slide-up">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {t('builtSecure.title.line1')}
              </h2>
              <h2 className="mt-2 font-handwriting text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
                {t('builtSecure.title.line2')}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            <ScrollReveal animation="slide-up" delay={100}>
              <div className="group flex h-full cursor-pointer flex-col items-start gap-4 rounded-xl border border-gray-100 bg-[#FAFBFD]/50 p-8 shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-md">
                <div className="rounded-lg border border-gray-100 bg-white p-2.5 text-gray-600 transition-transform duration-300 group-hover:scale-110">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="mt-2 text-lg font-bold text-gray-900">
                  {t('builtSecure.points.smartAccessEngine.title')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {t('builtSecure.points.smartAccessEngine.description')}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="slide-up" delay={250}>
              <div className="group flex h-full cursor-pointer flex-col items-start gap-4 rounded-xl border border-gray-100 bg-[#FAFBFD]/50 p-8 shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-md">
                <div className="rounded-lg border border-gray-100 bg-white p-2.5 text-gray-600 transition-transform duration-300 group-hover:scale-110">
                  <Settings className="h-5 w-5" />
                </div>
                <h3 className="mt-2 text-lg font-bold text-gray-900">
                  {t('builtSecure.points.policyDrivenControls.title')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {t('builtSecure.points.policyDrivenControls.description')}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="slide-up" delay={400}>
              <div className="group flex h-full cursor-pointer flex-col items-start gap-4 rounded-xl border border-gray-100 bg-[#FAFBFD]/50 p-8 shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-md">
                <div className="rounded-lg border border-gray-100 bg-white p-2.5 text-gray-600 transition-transform duration-300 group-hover:scale-110">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-2 text-lg font-bold text-gray-900">
                  {t('builtSecure.points.zeroTrust.title')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {t('builtSecure.points.zeroTrust.description')}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* one platform */}
      <section id="features" className="w-full bg-white px-4 py-20 md:px-20">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal animation="slide-up">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
                {t('onePlatform.title.onePlatform')}{' '}
                <span className="mt-2 font-handwriting text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
                  {t('onePlatform.title.allYourBusiness')}
                </span>{' '}
                <span>{t('onePlatform.title.needs')}</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-10 md:grid-cols-2">
            {features1?.map((feature, index) => (
              <ScrollReveal
                key={feature?.key}
                animation="slide-up"
                delay={index * 150}
              >
                <div className="group flex cursor-pointer items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-700 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-[#288af9]/10 group-hover:text-[#288af9]">
                    {feature?.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 transition-colors duration-200 group-hover:text-[#288af9]">
                      {t(`onePlatform.cards.${feature.key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">
                      {t(`onePlatform.cards.${feature.key}.description`)}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* data works */}
      <section className="w-full overflow-hidden bg-white py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-12 md:flex-row md:items-start md:justify-between">
          <ScrollReveal animation="slide-left" className="w-full max-w-4xl">
            <Image
              src="/data-image.png"
              width={400}
              height={400}
              alt={t('hero.imageAlt')}
              className="w-full max-w-4xl"
            />
          </ScrollReveal>

          <ScrollReveal animation="slide-right" className="w-full max-w-xl">
            <div className="flex w-full flex-col justify-center text-left sm:h-[400px]">
              <h2 className="text-base font-semibold text-gray-900 sm:text-4xl md:text-5xl">
                {t('dataThatWorks.title.dataThatWorks')}{' '}
                <span className="mb-2 inline-block font-handwriting text-lg sm:text-5xl md:text-6xl">
                  {t('dataThatWorks.title.forYou')}
                </span>{' '}
              </h2>
              <p className="mt-4 font-semibold text-gray-600">
                {t('dataThatWorks.subtitle')}
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 font-semibold text-gray-600">
                <li>{t('dataThatWorks.bullets.readable')}</li>
                <li>{t('dataThatWorks.bullets.verifiable')}</li>
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* For Enterprise */}
      <section className="px-4 py-20 md:px-20">
        <ScrollReveal animation="slide-up">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-3xl md:text-5xl">
              {t('audience.title.for')}{' '}
              <span className="inline-block font-handwriting text-2xl sm:text-4xl md:text-6xl">
                {t('audience.title.enterprises')}
              </span>{' '}
              {t('audience.title.andEveryone')}
            </h2>
            <p className="mt-4 text-base text-gray-600">
              {t('audience.subtitle')}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {features2?.map((feature, index) => (
            <ScrollReveal
              key={feature?.key}
              animation="slide-up"
              delay={index * 150}
            >
              <Card className="group flex h-full cursor-pointer flex-col items-start gap-4 rounded-xl border border-gray-200 px-6 py-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#EA5868]/20 hover:shadow-lg">
                {feature?.icon}
                <CardContent className="p-0">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t(`audience.cards.${feature.key}.title`)}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {t(`audience.cards.${feature.key}.description`)}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* pricing */}
      {/* <section id="pricing" className="bg-white px-4 py-24 md:px-8">
        <div className="rounded-2xl border border-gray-100/10 bg-gradient-bg px-6 pt-20 text-center shadow-sm sm:mx-10">
          <ScrollReveal animation="slide-up">
            <h2 className="text-xl font-semibold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
              {t('pricing.title.transparent')}{' '}
              <span className="inline-block font-handwriting text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
                {t('pricing.title.pricing')}
              </span>
              <br />
              {t('pricing.title.startFor')}
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="slide-up" delay={150}>
            <div className="mt-6 flex flex-col items-center justify-center gap-2 text-sm md:flex-row md:gap-6">
              <p className="flex items-center gap-1">
                {t('pricing.benefits.freemiumForever')}
              </p>
              <p className="flex items-center gap-1">
                {t('pricing.benefits.zeroLockIn')}
              </p>
              <p className="flex items-center gap-1">
                {t('pricing.benefits.noOnboardingFees')}
              </p>
            </div>
          </ScrollReveal>

          <div className="relative mt-14 flex justify-center">
            <ScrollReveal
              animation="scale-up"
              delay={300}
              duration={800}
              className="z-10 w-full max-w-4xl"
            >
              <figure className="mt-10 flex justify-center px-2">
                <Image
                  src="/pricing-image.png"
                  alt={t('pricing.imageAlt')}
                  width={800}
                  height={500}
                  className="w-full max-w-4xl rounded-t-xl"
                />
              </figure>
            </ScrollReveal>
            <div className="absolute top-6 z-0 h-full w-[90%] rounded-xl bg-white/10 blur-2xl" />
          </div>
        </div>
      </section> */}

      {/* contact us */}
      <section id="contact" className="bg-white px-4 py-16 md:px-8">
        <ScrollReveal animation="slide-up">
          <GetInTouch />
        </ScrollReveal>
      </section>

      {/* footer */}
      <footer className="bg-gradient-bg px-4 pb-5 pt-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-2 space-y-6">
          <Link href="/" aria-label="Go to homepage">
            <Image
              src="/hues_logo.png"
              width={100}
              height={30}
              alt="HUES Logo"
            />
          </Link>

          <h2 className="text-2xl font-bold md:text-3xl">
            {t('footer.title.joinTheMovement')}{' '}
            <span className="text-[#EA5868]">
              {t('footer.title.buildWithBharat')}
            </span>
          </h2>

          <p className="text-sm md:text-base">{t('footer.subtitle')}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <a
              href="mailto:support@paraphernalia.in"
              className="flex items-center gap-2 rounded-full bg-[#1e2a3f] px-4 py-2 text-sm text-white hover:bg-[#28364e]"
            >
              <Mail size={16} /> {t('footer.email')}
            </a>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#1e2a3f] px-4 py-2 text-sm text-white hover:bg-[#28364e]"
            >
              <Globe size={16} /> {t('footer.website')}
            </a>
          </div>

          <div className="w-full border-t border-dashed border-gray-700/60"></div>

          <div className="mt-8 pt-4 text-white">{t('footer.closingLine')}</div>
        </div>
      </footer>
    </div>
  );
}
