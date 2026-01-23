'use client';

import { goToHomePage } from '@/appUtils/redirectionUtilFn';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Globe, Mail, Menu, Phone, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '../globals.css';
import { LocalStorageService } from '@/lib/utils';
import { parseJwt } from '@/appUtils/helperFunctions';

const features = [
  {
    title: 'Verified Onboarding',
    description: 'Aadhaar and PAN-based KYC with live compliance checks.',
    icon: <Image src="/Identity.png" width={70} height={70} alt="Chart Icon" />,
  },
  {
    title: 'Always Audit-Ready',
    description:
      'MCA/GSTN trails, digital signatures, and tamper-proof logs — out of the box.',
    icon: <Image src="/Data.png" width={70} height={70} alt="Chart Icon" />,
  },
  {
    title: 'AI at Every Step',
    description:
      'Auto-convert invoices, populate SKUs, detect fraud, and automate reconciliation.',
    icon: <Image src="/Business.png" width={70} height={70} alt="Chart Icon" />,
  },
];

const features1 = [
  {
    title: 'Vendor Management',
    icon: (
      <Image
        src="/vendor-management-image.png"
        width={500}
        height={500}
        alt="Chart Icon"
      />
    ),
    description: 'From onboarding to e-invoicing — track every touchpoint.',
  },
  {
    title: 'Sales & Purchase Automation',
    icon: (
      <Image
        src="/sales-purchase-image.png"
        width={500}
        height={500}
        alt="Chart Icon"
      />
    ),
    description: 'Real-time negotiation tools, SKU sync, offer/bid sharing.',
  },
  {
    title: 'Tax & Legal Compliance',
    icon: (
      <Image src="/tax-image.png" width={500} height={500} alt="Chart Icon" />
    ),
    description: 'DPDP, PMLA, GST, MCA — done..',
  },
  {
    title: ' Built-in BI Tools',
    icon: (
      <Image
        src="/built-in-bi-image.png"
        width={500}
        height={500}
        alt="Chart Icon"
      />
    ),
    description: 'Live dashboards for Sales, Cash Flow, and Trial Balance',
  },
];

const features2 = [
  {
    title: 'Corporates & MSME',
    description:
      'One-click onboarding, freemium access, and AI-driven insights.',
    icon: <Image src="/Identity.png" width={70} height={70} alt="Chart Icon" />,
  },
  {
    title: 'Auditors & Investors',
    description:
      'No more PDFs — get clean, structured, traceable financial data.',
    icon: <Image src="/Identity.png" width={70} height={70} alt="Chart Icon" />,
  },
];

export default function HeroSection() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

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
              // placeholder="blur"
              // blurDataURL="/hues_logo.png"
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
            <NavigationMenuList className="flex items-center gap-10 text-sm font-medium text-black">
              {/* <NavigationMenuItem>
                <Link href="#features">Features</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#pricing">Pricing</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#faqs">FAQs</Link>
              </NavigationMenuItem> */}
              <NavigationMenuItem>
                <Link href="#contact">Contacts</Link>
              </NavigationMenuItem>
              <Button size="sm" onClick={() => router.push('/login')}>
                Register
              </Button>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="absolute left-0 top-full z-10 w-full rounded-md border bg-white px-4 py-4 shadow-md md:hidden">
              <ul className="flex flex-col gap-4 text-sm font-medium text-black">
                {/* <li>
                  <Link href="#features" onClick={() => setIsOpen(false)}>
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" onClick={() => setIsOpen(false)}>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#faqs" onClick={() => setIsOpen(false)}>
                    FAQs
                  </Link>
                </li> */}
                <li>
                  <Link href="#contact" onClick={() => setIsOpen(false)}>
                    Contacts
                  </Link>
                </li>
                <li>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => router.push('/login')}
                  >
                    Register
                  </Button>
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
          {/* Decorative Icons */}
          <Image
            src="/Identity.png"
            width={60}
            height={60}
            alt="Chart Icon"
            className="absolute left-1 top-4 hidden sm:block"
          />
          <Image
            src="/Data.png"
            width={60}
            height={60}
            alt="People Icon"
            className="absolute bottom-12 left-4 hidden sm:block"
          />
          <Image
            src="/Business.png"
            width={60}
            height={60}
            alt="Bag Icon"
            className="absolute right-2 top-20 hidden sm:block"
          />

          {/* Badge */}
          <p className="mb-4 rounded-full bg-[#F8BA0530] px-4 py-1 text-xs font-semibold text-[#B68800] sm:text-sm">
            🔥 Verified by Users. Endorsed by Professionals. Compliant by Design
          </p>

          {/* Hero Heading */}
          <h1 className="font-bold leading-tight text-[#1A1A1A] sm:text-5xl md:text-7xl">
            Redefining{' '}
            <span className="mb-5 inline-block rotate-[-2deg] font-handwriting text-[#EA5868] sm:text-6xl md:text-8xl">
              ERP
            </span>{' '}
            for a <span>Digital Bharat</span>
          </h1>

          {/* Subtext */}
          <p className="mt-4 max-w-2xl font-semibold text-gray-600 md:text-base">
            {`Hues isn’t just another ERP. It's your AI-powered command center for
            smarter business decisions, verifiable compliance, seamless
            collaboration — and peace of mind. Built on India’s Digital Public
            Infrastructure and hardened by blockchain.`}
          </p>

          {/* CTA */}
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
            {/* <Button variant="blue_outline" className="w-40 rounded-sm bg-white">
              Watch demo
            </Button> */}
            <Button
              className="w-40 rounded-sm"
              onClick={() => router.push('/login')}
            >
              Start using
            </Button>
          </div>
        </section>

        {/* Dashboard Preview Image */}
        <figure className="mt-10 flex justify-center px-2">
          <Image
            src="/hero-image.png"
            width={800}
            height={500}
            alt="ERP Dashboard Preview"
            className="w-full max-w-4xl rounded-t-xl bg-white p-2"
          />
        </figure>
      </section>

      {/* why? */}
      <section className="bg-white px-4 py-20 md:px-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-7xl">
            Why{' '}
            <span className="inline-block font-handwriting text-4xl sm:text-6xl md:text-8xl">
              Choose
            </span>{' '}
            Hues?
          </h2>
          <p className="mt-4 text-base text-gray-600">
            Experience the power of AI-driven ERP that adapts to your business
            needs
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features?.map((feature) => (
            <Card
              key={feature?.title}
              className="flex h-full flex-col items-start gap-4 rounded-xl border border-gray-200 px-6 py-6 shadow-sm transition hover:shadow-md"
            >
              {feature?.icon}
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature?.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {feature?.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* built secure */}
      <section className="relative w-full overflow-hidden bg-[#FFF1F6] px-4 pb-10 pt-20 sm:rounded-b-[100px] sm:pb-0 md:px-8">
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* Text Content */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 md:text-3xl">
              <span className="inline-block font-handwriting text-2xl md:text-4xl">
                Built Secure.
              </span>{' '}
              From the Ground Up
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Your data isn&apos;t just protected — it&apos;s governed.
            </p>

            <figure className="mx-auto w-full max-w-md rounded sm:max-w-lg md:max-w-full">
              <Image
                src="/security-image.png"
                width={800}
                height={500}
                alt="ERP Dashboard Preview"
                className="w-full max-w-6xl rounded-xl"
              />
            </figure>
          </div>
          <ul className="flex h-full w-full flex-col gap-20 pt-10 text-gray-700">
            <li className="ml-2 list-disc">
              <strong>Smart Access Engine</strong>
              <br />
              Unified RBAC + ABAC: Role-based simplicity with context-aware
              precision. Every access request is logged, justified, and
              audit-ready.
            </li>
            <li className="ml-2 list-disc">
              <strong>Policy-Driven Controls</strong>
              <br />
              From who sees what to how long it’s stored — Hues enforces your
              SOPs automatically.
            </li>
            <li className="ml-2 list-disc">
              <strong>No Backdoors. No Workarounds.</strong>
              <br />
              Zero-trust architecture means no data leaves without verified
              consent. Ever.
            </li>
          </ul>
        </div>
      </section>

      {/* one platform */}
      <section id="features" className="w-full bg-[#EAF3FA] px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-base font-bold text-gray-900 sm:text-5xl md:text-5xl">
            One Platform.{' '}
            <span className="mb-2 inline-block font-handwriting text-lg sm:text-6xl md:text-6xl">
              All Your Business
            </span>{' '}
            Needs.
          </h2>
          <p className="mt-2 text-sm font-semibold text-gray-600">
            Comprehensive business management tools powered by AI
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {features1?.map((feature) => (
            <div
              key={feature?.title}
              className="flex flex-col justify-end rounded-md bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              {feature?.icon}
              <h3 className="text-base font-semibold text-gray-900">
                {feature?.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {feature?.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* data works */}
      <section className="w-full bg-white py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-12 md:flex-row md:items-start md:justify-between">
          {/* Left Side - Image Placeholder */}
          <Image
            src="/data-image.png"
            width={400}
            height={400}
            alt="ERP Dashboard Preview"
            className="w-full max-w-4xl"
          />

          {/* Right Side - Content */}
          <div className="flex w-full max-w-xl flex-col justify-center text-left sm:h-[400px]">
            <h2 className="text-base font-semibold text-gray-900 sm:text-4xl md:text-5xl">
              Data That Works{' '}
              <span className="mb-2 inline-block font-handwriting text-lg sm:text-5xl md:text-6xl">
                for you, with you
              </span>{' '}
            </h2>
            <p className="mt-4 font-semibold text-gray-600">
              Your data is no longer static. Hues makes it:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 font-semibold text-gray-600">
              <li>
                Readable: Convert Excel, PDF, or image-based forms into
                structured SKUs.
              </li>
              <li>Verifiable: digital signature trails.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* For Enterprise */}
      <section className="bg-white px-4 py-20 md:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-3xl md:text-5xl">
            For{' '}
            <span className="inline-block font-handwriting text-2xl sm:text-4xl md:text-6xl">
              Enterprises, MSMEs, Auditors
            </span>{' '}
            and Everyone in Between
          </h2>
          <p className="mt-4 text-base text-gray-600">
            Experience the power of AI-driven ERP that adapts to your business
            needs
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {features2?.map((feature) => (
            <Card
              key={feature?.title}
              className="flex h-full flex-col items-start gap-4 rounded-xl border border-gray-200 px-6 py-6 shadow-sm transition hover:shadow-md"
            >
              {feature?.icon}
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature?.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {feature?.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="bg-white px-4 py-24 md:px-8">
        <div className="bg-gradient-bg px-6 pt-20 text-center sm:mx-10">
          <h2 className="text-xl font-semibold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
            Transparent{' '}
            <span className="inline-block font-handwriting text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
              Pricing.
            </span>
            <br />
            Start for ₹1,000/month.
          </h2>

          <div className="mt-6 flex flex-col items-center justify-center gap-2 text-sm md:flex-row md:gap-6">
            <p className="flex items-center gap-1">
              ✅ <span>Freemium forever for solo-preneurs.</span>
            </p>
            <p className="flex items-center gap-1">
              ✅ <span>Zero Lock-in</span>
            </p>
            <p className="flex items-center gap-1">
              ✅ <span>No onboarding fees. No guesswork. Just value</span>
            </p>
          </div>

          {/* <div className="mt-8">
            <Button
              size="sm"
              onClick={() => {
                router.push('/login');
              }}
            >
              Start 14 days free trial →
            </Button>
          </div> */}

          <div className="relative mt-14 flex justify-center">
            <figure className="mt-10 flex justify-center px-2">
              {/* Replace src with your own image or next/image logic */}
              <Image
                src="/pricing-image.png"
                alt="Pricing UI"
                width={800}
                height={500}
                className="w-full max-w-4xl"
              />
            </figure>
            {/* Layered effect for background card shadows */}
            <div className="absolute top-6 z-0 h-full w-[90%] rounded-xl bg-white/10 blur-2xl" />
          </div>
        </div>
      </section>

      {/* join movement */}
      <section
        id="faqs"
        className="bg-white px-4 py-16 text-center text-gray-800"
      >
        <div className="mx-auto max-w-4xl text-xl font-medium leading-relaxed md:text-5xl">
          <p className="relative inline-block text-gray-900">
            <span className="ml-1 text-4xl text-[#EA5868]">“</span>
            <span className="text-xl font-semibold md:text-4xl">
              Join the Movement.
            </span>
            <span className="ml-2 font-handwriting text-2xl text-gray-700 md:text-5xl">
              Build with Bharat.
            </span>
          </p>
          <p className="text-xl md:text-4xl">
            <span className="font-semibold">
              Thousands of users. Billions in transactions.
            </span>{' '}
            All tamper-proof, transparent, and trusted
            <span className="ml-1 text-xl text-[#EA5868] md:text-4xl">”</span>
          </p>
        </div>
      </section>

      {/* footer */}
      <footer id="contact" className="bg-gradient-bg px-4 pb-5 pt-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-2 space-y-6">
          <Link href="/" aria-label="Go to homepage">
            <Image
              src="/hues_logo.png"
              width={100}
              height={30}
              alt="HUES Logo"
              // placeholder="blur"
              // blurDataURL="/hues_logo.png"
            />
          </Link>

          <h2 className="text-2xl font-bold md:text-3xl">
            Join the Movement.{' '}
            <span className="text-[#EA5868]">Build with Bharat.</span>
          </h2>

          <p className="text-sm md:text-base">
            Thousands of users. Billions in transactions. All tamper-proof,
            transparent, and trusted.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <a
              href="tel:+919869350874"
              className="flex items-center gap-2 rounded-full bg-[#1e2a3f] px-4 py-2 text-sm text-white hover:bg-[#28364e]"
            >
              <Phone size={16} /> +91 9869 350 874
            </a>
            <a
              href="mailto:support@paraphernalia.in"
              className="flex items-center gap-2 rounded-full bg-[#1e2a3f] px-4 py-2 text-sm text-white hover:bg-[#28364e]"
            >
              <Mail size={16} /> support@paraphernalia.in
            </a>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#1e2a3f] px-4 py-2 text-sm text-white hover:bg-[#28364e]"
            >
              <Globe size={16} /> hues.paratech.ai
            </a>
          </div>

          <div className="w-full border-t border-dashed border-gray-700/60"></div>

          <div className="mt-8 pt-4 text-white">
            ✦ Built by IIT alumni. Powered by AI. Trusted by India’s backbone —
            its businesses.
          </div>
        </div>
      </footer>
    </div>
  );
}
