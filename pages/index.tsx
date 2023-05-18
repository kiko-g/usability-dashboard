import React from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import {
  ArrowLongRightIcon,
  CursorArrowRaysIcon,
  MapIcon,
  ViewColumnsIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames';

type NavAction = {
  title: string;
  text: string;
  href: string;
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
      title?: string | undefined;
      titleId?: string | undefined;
    } & React.RefAttributes<SVGSVGElement>
  >;
  iconClasses: string;
};

export default function Hub() {
  const actions: NavAction[] = [
    {
      title: 'Page Visits Insights',
      text: 'Take a look at how your users are using your software: page views, time spent on pages, frequent page pathways, devices used, and more.',
      href: '/visits',
      icon: ViewfinderCircleIcon,
      iconClasses:
        'bg-teal-50 ring-teal-50 group-hover:ring-teal-700 group-hover:bg-teal-700 group-hover:text-white text-teal-700',
    },
    {
      title: 'Wizard Interactions',
      text: 'Take a look at how your users are using the wizards: grouped wizards insights with time spent on wizards, errors, previous step clicks, completion rates, individual wizard inspection, and more.',
      href: '/wizards',
      icon: MapIcon,
      iconClasses:
        'bg-orange-50 ring-orange-50 group-hover:ring-orange-700 group-hover:bg-orange-700 group-hover:text-white text-orange-700',
    },
    {
      title: 'Execution Views Interactions',
      text: 'Take a look at how your users are using the execution views: grouped execution views insights with time spent on execution views, errors, previous step clicks, completion rates, individual execution view inspection, and more.',
      href: '/executions',
      icon: ViewColumnsIcon,
      iconClasses:
        'bg-sky-50 ring-sky-50 group-hover:ring-sky-700 group-hover:bg-sky-700 group-hover:text-white text-sky-700',
    },
    {
      title: 'Button Clicks',
      text: 'Inspect the button clicks and see which buttons are clicked the most and which are clicked the least among other insights.',
      href: '/buttons',
      icon: CursorArrowRaysIcon,
      iconClasses:
        'bg-rose-50 ring-rose-50 group-hover:ring-rose-700 group-hover:bg-rose-700 group-hover:text-white text-rose-700',
    },
  ];

  return (
    <Layout location="Hub">
      <article className="flex flex-col space-y-4">
        <div className="flex flex-col justify-center gap-2">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Dashboard Main Hub</h2>
          <p className="max-w-4xl grow text-lg font-normal">
            Welcome to the MES Usability Dashboard. This is where you can gain insight into how the users are
            interacting with the platform and get to know whether the platform has any usability issues.
          </p>
        </div>

        <div className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-transparent bg-gray-200 shadow dark:bg-slate-400 sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
          {actions.map((action, actionIdx) => (
            <Link
              href={action.href}
              key={action.title}
              className={classNames(
                actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
                actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
                actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg' : '',
                actionIdx === actions.length - 1 ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none' : '',
                'group relative bg-white p-6 transition focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary hover:bg-slate-100 dark:bg-darkest'
              )}
            >
              <div>
                <span className={classNames(action.iconClasses, 'inline-flex rounded-lg p-3 ring-4 transition')}>
                  <action.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                  <a href={action.href} className="focus:outline-none">
                    {/* Extend touch target to entire panel */}
                    <span className="absolute inset-0" aria-hidden="true" />
                    {action.title}
                  </a>
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-200">{action.text}</p>
              </div>
              <span
                className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-500"
                aria-hidden="true"
              >
                <ArrowLongRightIcon className="h-5 w-5 transition group-hover:-rotate-45 md:h-6 md:w-6" />
              </span>
            </Link>
          ))}
        </div>
      </article>
    </Layout>
  );
}
