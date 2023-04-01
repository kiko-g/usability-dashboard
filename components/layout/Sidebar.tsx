import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import classNames from 'classnames'
import { DarkModeSwitch } from './'
import { CursorArrowRippleIcon, HomeIcon } from '@heroicons/react/24/solid'

type Props = {
  location: string
}

export default function Sidebar({ location }: Props) {
  const items = [
    {
      name: 'Hub',
      href: '/',
      icon: HomeIcon,
    },
    {
      name: 'Mouse',
      href: '/mouse',
      icon: CursorArrowRippleIcon,
    },
  ]

  const socials = [
    {
      name: 'GitHub',
      href: 'https://github.com/kiko-g/usability-dashboard-mes',
      svg: [
        'M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z',
      ],
      viewBox: '0 0 496 512',
    },
  ]

  return (
    <aside className="hidden h-screen min-w-full flex-col space-y-4 bg-white p-5 dark:bg-darkest md:flex md:min-w-[20rem]">
      <div className="flex items-center justify-start gap-2 px-2">
        {/* <Image src="/logo.svg" alt="CMF MES" width={256} height={256} className="h-8 w-8" /> */}
        <span className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-sky-500 dark:to-sky-700" />
        <h1 className="text-3xl font-medium tracking-tighter">CMF MES UX</h1>
      </div>
      <hr />
      <ul className="flex w-full flex-1 flex-col space-y-3">
        {items.map((item, itemIdx) => {
          const isActive = location.toLowerCase() === item.name.toLowerCase()
          return (
            <li key={`nav-${itemIdx}`}>
              <Link
                href={item.href}
                className={classNames(
                  isActive
                    ? 'bg-slate-800 text-white hover:opacity-80 dark:bg-sky-600'
                    : 'hover:bg-slate-200 dark:hover:bg-sky-600/30',
                  `flex cursor-pointer items-center gap-2 rounded px-3 py-3 text-sm transition`
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          )
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
                className="h-5 w-5 md:h-6 md:w-6"
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
  )
}
