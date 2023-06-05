import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { DarkModeSwitch } from './';
import { Disclosure } from '@headlessui/react';
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

const socials = [
  {
    name: 'GitHub',
    href: 'https://github.com/kiko-g/usability-dashboard-mes',
    svg: [
      'M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z',
    ],
    viewBox: '0 0 496 512',
  },
];

type SidebarProps = {
  location: string;
};

export function Sidebar({ location }: SidebarProps) {
  return (
    <aside className="hidden h-screen min-w-full flex-col space-y-4 bg-white p-5 dark:bg-darkest md:flex md:min-w-[20%]">
      <div className="flex items-center justify-start gap-2 px-2">
        <span className="h-8 w-8 rounded-full bg-primary shadow dark:bg-secondary" />
        <h1 className="text-2xl font-medium tracking-tighter">CMF MES UX</h1>
      </div>
      <hr />
      <ul className="flex w-full flex-1 flex-col space-y-2">
        {navigations
          .filter((item) => item.shown !== false)
          .map((item, itemIdx) => {
            const isActive = location.toLowerCase() === item.name.toLowerCase();
            return (
              <li key={`nav-${itemIdx}`}>
                <Link
                  href={item.href}
                  className={classNames(
                    isActive
                      ? 'bg-primary text-white hover:opacity-80 dark:bg-secondary/80'
                      : 'hover:bg-primary/10 dark:hover:bg-secondary/30',
                    `flex cursor-pointer items-center gap-2 rounded px-3 py-3 text-sm transition ease-in-out`
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
      </ul>
      <hr />
      <div className="flex items-center justify-between gap-3">
        <div>
          {socials.map((social, socialIdx) => (
            <Link
              target="_blank"
              href={social.href}
              key={`social-${socialIdx}`}
              title={social.name}
              aria-label={social.name}
              className={`transition ${social.name}`}
            >
              <svg
                className="h-5 w-5 md:h-5 md:w-5"
                fill="currentColor"
                viewBox={social.viewBox ? social.viewBox : '0 0 24 24'}
                aria-hidden="true"
              >
                {social.svg.map((d, dIdx) => (
                  <path fillRule="evenodd" d={d} clipRule="evenodd" key={`social-${socialIdx}-svg-${dIdx}`} />
                ))}
              </svg>
            </Link>
          ))}
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
                {socials.map((social, socialIdx) => (
                  <Link
                    target="_blank"
                    href={social.href}
                    key={`social-${socialIdx}`}
                    title={social.name}
                    aria-label={social.name}
                    className={`transition ${social.name}`}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox={social.viewBox ? social.viewBox : '0 0 24 24'}
                      aria-hidden="true"
                    >
                      {social.svg.map((d, dIdx) => (
                        <path fillRule="evenodd" d={d} clipRule="evenodd" key={`social-${socialIdx}-svg-${dIdx}`} />
                      ))}
                    </svg>
                  </Link>
                ))}
              </div>
            </Disclosure.Panel>
          </header>
        );
      }}
    </Disclosure>
  );
}
