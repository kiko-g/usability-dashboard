import React from 'react'
import { MobileNav, Sidebar, Seo } from './'

type Props = {
  children?: JSX.Element | JSX.Element[]
  location: string
}

export default function Layout({ children, location }: Props) {
  const title = 'CMF MES UX Dashboard'
  return (
    <>
      <Seo location={location} />
      <div className="flex h-screen w-full overflow-hidden bg-ice font-prose font-normal text-gray-800 dark:bg-dark dark:text-white">
        <Sidebar location={location} />
        <main className="flex min-h-screen w-full flex-col overflow-x-hidden overflow-y-scroll">
          <MobileNav title={title} location={location} />
          <div>{children}</div>
        </main>
      </div>
    </>
  )
}
