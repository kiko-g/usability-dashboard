import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ScoringApproach } from '@/@types';
import { EllipsisHorizontalCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

type Props = {
  scoringApproaches: ScoringApproach[];
  scoringApproachHook: [ScoringApproach, React.Dispatch<React.SetStateAction<ScoringApproach>>];
};

export function SelectFormula({ scoringApproaches, scoringApproachHook }: Props) {
  const [scoringApproach, setScoringApproach] = scoringApproachHook;

  return (
    <Listbox value={scoringApproach} onChange={setScoringApproach}>
      <div className="relative z-30 flex w-min items-center justify-center">
        <Listbox.Button as="button" title="Switch Scoring Approach" className="hover:opacity-80">
          <EllipsisHorizontalCircleIcon className="h-6 w-6" aria-hidden="true" />
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute right-0 top-6 w-36 overflow-auto rounded border border-gray-300 bg-gray-100 py-2 shadow xl:w-36">
            {scoringApproaches.map((approach: string, optionIdx: number) => (
              <Listbox.Option
                key={`option-${optionIdx}`}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-1.5 pl-10 pr-5 text-sm font-normal tracking-tight ${
                    active ? 'bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary' : 'text-gray-800'
                  }`
                }
                value={approach}
              >
                <span
                  className={`block whitespace-nowrap ${
                    approach === scoringApproach ? 'font-semibold' : 'font-normal'
                  }`}
                >
                  Formula {approach}
                </span>
                {scoringApproach === approach ? (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-500">
                    <CheckCircleSolidIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : null}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
