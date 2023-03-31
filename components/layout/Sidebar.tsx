import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import classNames from 'classnames'
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

  return (
    <aside className="flex min-w-[20rem] flex-col space-y-4 border-r bg-white p-4">
      <div className="flex items-center justify-start gap-2 px-2">
        {/* <Image src="/logo.svg" alt="CMF MES" width={256} height={256} className="h-8 w-8" /> */}
        <span className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700" />
        <h1 className="text-3xl font-medium tracking-tighter">CMF MES UX</h1>
      </div>
      <hr />
      <ul className="flex w-full flex-col space-y-2">
        {items.map((item, itemIdx) => {
          const isActive = location.toLowerCase() === item.name.toLowerCase()
          return (
            <li key={`nav-${itemIdx}`}>
              <Link
                href={item.href}
                className={classNames(
                  isActive ? 'bg-sky-950 text-white hover:opacity-80' : 'hover:bg-sky-100',
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
    </aside>
  )
}
