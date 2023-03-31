import React from 'react'
import { Sidebar, Seo } from './'

type Props = {
  children?: JSX.Element | JSX.Element[]
  location: string
}

export default function Layout({ children, location }: Props) {
  return (
    <>
      <Seo location={location} />
      <div className="flex min-h-screen w-full bg-ice font-prose font-normal text-gray-800 dark:bg-navy dark:text-white">
        <Sidebar location={location} />
        <main className="flex min-h-screen w-full flex-col">
          <div>{children}</div>
        </main>
      </div>
    </>
  )
}
