import React from 'react'
import HeadComponent from './HeadComponent'
import Header from './Header'
import Footer from './Footer'

type Props = {
  children?: JSX.Element | JSX.Element[]
  location: string
  description?: string
}

export default function Layout({ children, location, description }: Props) {
  return (
    <>
      <HeadComponent location={location} description={description} />
      <div className="flex min-h-screen w-full flex-col bg-ice font-prose font-medium text-gray-800 dark:bg-navy dark:text-white">
        <Header location={location} />
        <div className="min-h-adjusted">{children}</div>
        <Footer />
      </div>
    </>
  )
}
