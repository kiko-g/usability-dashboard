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
      href={process.env.NEXT_PUBLIC_MATOMO_DASHBOARD_URL || 'http://localhost:8089'}
      className="group flex items-center justify-between gap-3 rounded-lg border border-transparent bg-white p-5 transition hover:border-primary hover:bg-primary/70 dark:border-secondary/50 dark:bg-secondary/20 dark:hover:bg-secondary/50"
    >
      <div className="flex items-center justify-center gap-3">
        <Image
          src="/matomo.png"
          alt="Matomo Icon"
          width={64}
          height={64}
          className="rounded-full bg-gray-100 p-2 shadow group-hover:bg-white"
        />
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-slate-700 group-hover:text-white dark:text-white">
            Access Matomo Dashboard
          </h3>
          <p className="mt-0.5 max-w-[80%] text-sm text-gray-500 group-hover:text-white dark:text-gray-200">
            Take a look into the default metrics, analytics and information directly provided by Matomo. This standard
            dashboard serves as a complement to our dashboard with custom and processed metrics extracted from Matomo
            events.
          </p>
        </div>
      </div>

      <div>
        <ArrowTopRightOnSquareIcon className="h-8 w-8 text-gray-300 transition group-hover:scale-125 group-hover:text-white dark:text-gray-300 dark:group-hover:text-white" />
      </div>
    </Link>
  );
}
