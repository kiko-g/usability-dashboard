import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

type Props = {};

export default function MatomoDashboardCard({}: Props) {
  return (
    <Link
      target="_blank"
      title="Access Matomo Dashboard"
      href={process.env.NEXT_PUBLIC_MATOMO_DASHBOARD_URL}
      className="group flex flex-col items-center justify-between gap-3 rounded-lg border border-transparent bg-white p-5 transition hover:border-primary hover:bg-primary/70 dark:border-secondary/50 dark:bg-secondary/20 dark:hover:bg-secondary/50 lg:flex-row"
    >
      <div className="flex flex-col items-center justify-center gap-3 lg:flex-row">
        <Image
          src="/matomo.png"
          alt="Matomo Icon"
          width={64}
          height={64}
          className="rounded-full bg-gray-100 p-2 shadow group-hover:bg-white"
        />
        <div className="flex flex-col">
          <h3 className="flex items-center gap-1 text-xl font-bold text-slate-700 group-hover:text-white dark:text-white">
            <span className="leading-6 lg:leading-normal">Access Matomo Dashboard</span>
            <ArrowTopRightOnSquareIcon className="flex h-5 w-5 text-gray-600 transition group-hover:scale-125 group-hover:text-white dark:text-gray-300 dark:group-hover:text-white lg:hidden" />
          </h3>
          <p className="mt-2 max-w-full text-sm tracking-tighter text-gray-500 group-hover:text-white dark:text-gray-200 lg:mt-0.5 lg:max-w-[80%] lg:tracking-normal">
            Take a look into the default metrics, analytics and information directly provided by Matomo. This standard
            dashboard serves as a complement to our dashboard with custom and processed metrics extracted from Matomo
            events.
          </p>
        </div>
      </div>

      <div>
        <ArrowTopRightOnSquareIcon className="hidden h-8 w-8 text-gray-300 transition group-hover:scale-125 group-hover:text-white dark:text-gray-300 dark:group-hover:text-white lg:flex" />
      </div>
    </Link>
  );
}
