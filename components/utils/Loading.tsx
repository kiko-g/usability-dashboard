import React from 'react'

type Props = {}

export default function Loading({}: Props) {
  return (
    <div className="flex h-72 items-center justify-center rounded border border-teal-600/50 bg-teal-600/10 dark:border-blue-600/50 dark:bg-blue-600/10">
      <svg
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="-ml-1 mr-3 h-12 w-12 animate-spin text-teal-600 dark:text-blue-600"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
          3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  )
}
