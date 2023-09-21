import React from 'react'
import ServiceNotice from '@/components/ServiceNotice'

type Props = {
  message?: string
}

export default function NotFound({ message }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center space-y-4 rounded border border-rose-400 bg-rose-200/50 p-8 dark:bg-rose-700/25">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white md:text-5xl">Uh-oh!</h1>
        <p className="space-x-2 font-medium text-rose-800 dark:text-white">
          <span>{message ? message : 'There was a problem loading the content'}</span>
          <span>❌</span>
        </p>
      </div>
      <ServiceNotice />
    </div>
  )
}
