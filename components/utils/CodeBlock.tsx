import React from 'react';

type Props = {
  children?: React.ReactNode;
};

export default function CodeBlock({ children }: Props) {
  return (
    <code className="mb-2 mt-1 block bg-navy px-3 py-2 text-sm font-normal tracking-[-0.07rem] text-white dark:bg-white/10 dark:text-white">
      {children}
    </code>
  );
}
