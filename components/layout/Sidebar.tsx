import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { DarkModeSwitch } from './';
import { navigations, socials } from '../../utils/vars';

type Props = {
  location: string;
};

export default function Sidebar({ location }: Props) {
  return (
    <aside className="hidden h-screen min-w-full flex-col space-y-4 bg-white p-5 dark:bg-darkest md:flex md:min-w-[20%]">
      <div className="flex items-center justify-start gap-2 px-2">
        <span className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-violet-400 dark:to-purple-400" />
        <h1 className="text-2xl font-medium tracking-tighter">CMF MES UX</h1>
      </div>
      <hr />
      <ul className="flex w-full flex-1 flex-col space-y-2">
        {navigations.map((item, itemIdx) => {
          const isActive = location.toLowerCase() === item.name.toLowerCase();
          return (
            <li key={`nav-${itemIdx}`}>
              <Link
                href={item.href}
                className={classNames(
                  isActive
                    ? 'bg-primary text-white hover:opacity-80 dark:bg-secondary/80'
                    : 'hover:bg-primary/10 dark:hover:bg-secondary/30',
                  `flex cursor-pointer items-center gap-2 rounded px-3 py-3 text-sm transition ease-in-out`
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <hr />
      <div className="flex items-center justify-between gap-3">
        <div>
          {socials.map((social, socialIdx) => (
            <Link
              target="_blank"
              href={social.href}
              key={`social-${socialIdx}`}
              title={social.name}
              aria-label={social.name}
              className={`transition ${social.name}`}
            >
              <svg
                className="h-5 w-5 md:h-5 md:w-5"
                fill="currentColor"
                viewBox={social.viewBox ? social.viewBox : '0 0 24 24'}
                aria-hidden="true"
              >
                {social.svg.map((d, dIdx) => (
                  <path fillRule="evenodd" d={d} clipRule="evenodd" key={`social-${socialIdx}-svg-${dIdx}`} />
                ))}
              </svg>
            </Link>
          ))}
        </div>
        <DarkModeSwitch />
      </div>
    </aside>
  );
}
