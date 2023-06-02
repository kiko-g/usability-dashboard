import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classNames from 'classnames';
import { ArrowPathIcon, CheckCircleIcon, ShieldExclamationIcon, XMarkIcon } from '@heroicons/react/24/solid';

type Props = {};

type AvailabilityType = 'available' | 'unavailable' | null;

export default function ServiceNotice({}: Props) {
  const [message, setMessage] = useState<string>('');
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [serviceStatus, setServiceStatus] = useState<AvailabilityType>(null);

  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        // Update the URL to match your API route
        const response = await axios.get('/api/matomo/ping');

        if (response.status === 200) {
          setServiceStatus('available');
        } else {
          setMessage(response.data.message === '' ? response.data.toString() : response.data.message);
          setServiceStatus('unavailable');
        }
      } catch (error) {
        setServiceStatus('unavailable');
      }
    };

    checkServiceStatus();
  }, []);

  return (
    <div
      className={classNames(
        'relative w-full rounded-md border p-4',
        serviceStatus === 'available' && 'border-emerald-400 bg-emerald-50/60 dark:bg-emerald-50/90',
        serviceStatus === 'unavailable' && 'border-rose-400 bg-rose-50/60 dark:bg-rose-50/90',
        serviceStatus === null && 'border-gray-400 bg-gray-50/60 dark:bg-gray-50/90',
        dismissed ? 'hidden' : 'block'
      )}
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-4 rounded p-1 transition hover:bg-rose-700 hover:text-white"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>

      {serviceStatus === 'available' && (
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-emerald-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-emerald-800">Matomo Service is available</h3>
            <div className="mt-2 text-sm text-emerald-700">
              <p>The Matomo API, our data source, is up and running as expected.</p>
            </div>
          </div>
        </div>
      )}

      {serviceStatus === 'unavailable' && (
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldExclamationIcon className="h-5 w-5 text-rose-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-rose-800">
              The Matomo API service is <strong>not</strong> responding
            </h3>
            <div className="mt-2 text-sm text-rose-700">
              <ul role="list" className="list-disc space-y-1 pl-5">
                <li>Matomo API said: &quot;{message}&quot;</li>
                <li>Check your auth token (Matomo Dashboard, Gear Icon, Personal, Security, Create Auth Token)</li>
                <li>
                  Check the ports and the <code>NEXT_PUBLIC_MATOMO_SITE_URL</code> value in your <code>.env</code> file
                </li>
                <li>You could be running only the Next JS dashboard app</li>
                <li>
                  You can use the mock data to get a feeling of what the dashboard should look like. Click the{' '}
                  <strong>database</strong> icon on the top right of the page to activate mock data.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {serviceStatus === null && (
        <div className="flex">
          <div className="flex-shrink-0">
            <ArrowPathIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">Checking Matomo Service</h3>
            <div className="mt-2 text-sm text-gray-700">
              <p>Waiting for Matomo service response.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
