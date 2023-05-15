import React from 'react';

type Props = {
  stats: Record<string, string | number>;
};

export default function MouseClickStats({ stats }: Props) {
  return (
    <div className="w-full rounded border border-primary bg-primary/70 px-2 py-2 dark:border-secondary/50 dark:bg-secondary/50 md:w-auto md:px-3 md:py-3">
      <div className="grid grid-cols-1 gap-y-1 text-xs text-white md:gap-y-0 md:text-sm">
        {Object.entries(stats).map(([key, value], index) => (
          <div key={`stats-${index}`} className="flex justify-between gap-x-4 md:gap-x-6">
            <span className="whitespace-nowrap font-semibold">{key}</span>
            <span className="text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
