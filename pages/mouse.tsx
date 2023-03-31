import React from 'react'
import Layout from '../components/layout/Layout'
import { MouseClicksAPI } from '../@types'
import MouseTable from '../components/MouseTable'

export default function Mouse() {
  return (
    <Layout location="Mouse">
      <main className="px-8 py-8">
        <div className="flex flex-col justify-center gap-2">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Mouse clicks</h2>
          <p className="grow text-lg font-normal">
            Here&apos;s a table of all the mouse clicks I&apos;ve made on my website.
          </p>
          <MouseTable />
        </div>
      </main>
    </Layout>
  )
}
