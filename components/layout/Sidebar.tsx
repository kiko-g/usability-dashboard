import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { DarkModeSwitch } from './';
import { Disclosure } from '@headlessui/react';
import GithubIcon from '@/components/utils/GithubIcon';
import {
  CursorArrowRippleIcon,
  HomeIcon,
  MagnifyingGlassCircleIcon,
  XMarkIcon,
  Bars3Icon,
  MapIcon,
  FingerPrintIcon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline';
import MatomoIcon from '@/components/utils/MatomoIcon';

const navigations = [
  {
    name: 'Hub',
    href: '/',
    icon: HomeIcon,
  },
  {
    name: 'Visits',
    href: '/visits',
    icon: MagnifyingGlassCircleIcon,
  },
  {
    name: 'Mouse',
    href: '/mouse',
    icon: CursorArrowRippleIcon,
    shown: false,
  },
  {
    name: 'Buttons',
    href: '/buttons',
    icon: FingerPrintIcon,
  },
  {
    name: 'Wizards',
    href: '/wizards',
    icon: MapIcon,
  },
  {
    name: 'Execution Views',
    href: '/executions',
    icon: RectangleGroupIcon,
  },
];

type SidebarProps = {
  location: string;
};

export function Sidebar({ location }: SidebarProps) {
  return (
    <aside className="hidden min-w-full shrink-0 flex-col space-y-4 bg-white p-5 dark:bg-darkest lg:flex lg:min-w-min">
      <div className="hidden items-center justify-center gap-2 px-2 xl:flex xl:justify-start">
        <span className="h-8 w-8 rounded-full bg-primary shadow dark:bg-secondary" />
        <h1 className="text-2xl font-medium tracking-tighter">CMF MES UX</h1>
      </div>
      <hr className="hidden xl:flex" />
      <ul className="flex w-full flex-1 flex-col space-y-2">
        {navigations
          .filter((item) => item.shown !== false)
          .map((item, itemIdx) => {
            const isActive = location.toLowerCase() === item.name.toLowerCase();
            return (
              <li key={`nav-${itemIdx}`}>
                <Link
                  title={item.name}
                  href={item.href}
                  className={classNames(
                    isActive
                      ? 'bg-primary text-white hover:opacity-80 dark:bg-secondary/80'
                      : 'hover:bg-primary/10 dark:hover:bg-secondary/30',
                    `flex cursor-pointer items-center justify-center gap-2 rounded px-3 py-3 text-sm transition ease-in-out xl:justify-start`
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="hidden xl:block">{item.name}</span>
                </Link>
              </li>
            );
          })}
      </ul>
      <hr />
      <div className="flex flex-col items-center justify-between gap-3 xl:flex-row">
        <div className="flex items-center gap-2">
          <Link
            target="_blank"
            href="https://github.com/kiko-g/usability-dashboard-mes"
            title="GitHub Link"
            aria-label="GitHub Link"
            className="github transition"
          >
            <GithubIcon className="h-5 w-5" />
          </Link>
          <Link
            target="_blank"
            href={process.env.NEXT_PUBLIC_MATOMO_DASHBOARD_URL || 'http://localhost:8089'}
            title="Access Matomo Dashboard"
            aria-label="Access Matomo Dashboard"
            className="github transition"
          >
            <MatomoIcon className="h-5 w-5" />
          </Link>
        </div>
        <DarkModeSwitch />
      </div>
    </aside>
  );
}

type MobileNavProps = {
  title: string;
  location: string;
};

export function MobileNav({ title, location }: MobileNavProps) {
  return (
    <Disclosure
      as="nav"
      className="sticky top-0 z-20 block bg-lighter/70 px-3 py-3 text-gray-800 backdrop-blur dark:bg-darkest/70 dark:text-white md:hidden lg:px-4 lg:py-2"
    >
      {({ open }) => {
        return (
          <header>
            <div className={`${open ? 'p-0' : 'p-2'} relative flex items-center justify-between lg:py-0`}>
              <div
                className={`z-50 lg:hidden ${
                  open
                    ? 'absolute right-2 top-2 my-auto flex h-6 items-center justify-end gap-x-3'
                    : 'flex w-full items-center justify-between gap-x-3'
                }`}
              >
                {open ? null : (
                  <Link href="/" className="flex items-center gap-x-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow dark:bg-gradient-to-br dark:from-teal-400 dark:to-cyan-400"></div>
                    <span className="whitespace-nowrap font-bold tracking-tight">{title}</span>
                  </Link>
                )}
                <div className="flex items-center gap-x-2">
                  <DarkModeSwitch />
                  <Disclosure.Button className="group -ml-[3px] py-[3px] text-gray-800 transition duration-200 ease-in dark:text-white lg:hidden">
                    <span className="sr-only">Open nav menu</span>
                    {open ? (
                      <XMarkIcon
                        className="ease block h-6 w-6 transition duration-200 group-hover:text-rose-600 dark:group-hover:text-rose-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <Bars3Icon
                        className="ease block h-6 w-6 transition duration-200 group-hover:text-primary dark:group-hover:text-secondary"
                        aria-hidden="true"
                      />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
            <Disclosure.Panel className="flex flex-col gap-y-3 py-2 lg:hidden">
              {navigations
                .filter((item) => item.shown !== false)
                .map((link, index) => (
                  <Link href={link.name} className="relative h-auto" key={`mobile-nav-${index}`}>
                    <button
                      type="button"
                      className={`flex h-auto items-center justify-center lowercase transition ${
                        location === link.name
                          ? 'font-bold text-primary dark:text-white'
                          : 'font-normal text-gray-800/50 hover:text-gray-800 dark:text-white/40 dark:hover:text-white'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-x-3">
                        <link.icon className="h-5 w-5" />
                        <span>{link.name}</span>
                      </span>
                    </button>
                  </Link>
                ))}
              <div className="relative flex h-auto items-center justify-end gap-x-4 border-t border-gray-300 pt-4 dark:border-gray-300/25">
                <Link
                  target="_blank"
                  href="https://github.com/kiko-g/usability-dashboard-mes"
                  title="GitHub Link"
                  aria-label="GitHub Link"
                  className="github transition"
                >
                  <GithubIcon className="h-5 w-5" />
                </Link>
                <Link
                  target="_blank"
                  href={process.env.NEXT_PUBLIC_MATOMO_DASHBOARD_URL || 'http://localhost:8089'}
                  title="Access Matomo Dashboard"
                  aria-label="Access Matomo Dashboard"
                  className="github transition"
                >
                  <MatomoIcon className="h-5 w-5" />
                </Link>
              </div>
            </Disclosure.Panel>
          </header>
        );
      }}
    </Disclosure>
  );
}
