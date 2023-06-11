import React from 'react';
import { Switch } from '@headlessui/react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import useDarkMode from '@/hooks/useDarkMode';

export default function DarkModeSwitch() {
  const [enabled, setEnabled] = useDarkMode();

  return (
    <Switch.Group>
      <div className="flex items-center">
        <Switch
          className={`${enabled ? 'animate-dark' : 'animate-light'} rounded-full`}
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
        >
          {enabled ? (
            <MoonIcon
              className="ease block h-6 w-6 text-blue-400 transition duration-150 hover:text-blue-500 md:h-6 md:w-6"
              aria-hidden="true"
            />
          ) : (
            <SunIcon
              className="ease block h-6 w-6 text-orange-300 transition duration-150 hover:text-orange-400/80 md:h-6 md:w-6"
              aria-hidden="true"
            />
          )}
        </Switch>
      </div>
    </Switch.Group>
  );
}
