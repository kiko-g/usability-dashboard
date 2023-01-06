import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import DarkModeSwitch from './DarkModeSwitch'
import classNames from 'classnames'

type Props = {
  location: string
}

export default function Header({ location }: Props) {
  const title = process.env.NEXT_PUBLIC_WEBSITE_NAME!
  const internalNav = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Feedback', href: '/feedback' },
    { name: 'Changelog', href: '/changelog' },
    { name: 'Help', href: '/help' },
  ]

  return (
    <header className="flex h-16 w-full bg-navy px-6 py-3 text-white">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-x-3">
          <div className="aspect-square h-7 w-7 overflow-hidden">
            <Image src="/gradient.svg" alt="App Logo" width={28} height={28} className="rounded-full object-cover" />
          </div>
          <h1 className="text-lg">
            <Link href="/" className="whitespace-nowrap transition hover:underline hover:opacity-80">
              {title}
            </Link>
          </h1>
        </div>
        {/* Mobile */}
        <div className="flex gap-x-3">
          {internalNav.map((item, itemIdx) => (
            <Link
              key={`external-nav-${itemIdx}`}
              href={item.href}
              className={classNames(
                'rounded px-2 py-1 transition hover:bg-white/20',
                item.name.toLowerCase() === location.toLowerCase()
                  ? 'font-bold text-primary underline hover:no-underline'
                  : ''
              )}
            >
              {item.name}
            </Link>
          ))}
          <DarkModeSwitch />
        </div>
      </div>
    </header>
  )
}
