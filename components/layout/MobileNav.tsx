import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Disclosure } from '@headlessui/react'
import { DarkModeSwitch } from '.'
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { navigations, socials } from '../../utils'

type Props = {
  title: string
  location: string
}

export default function MobileNav({ title, location }: Props) {
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
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow dark:bg-gradient-to-br dark:from-violet-400 dark:to-purple-400"></div>
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
              {navigations.map((link, index) => (
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
        )
      }}
    </Disclosure>
  )
}
