import React from 'react';
import Layout from '../components/layout/Layout';

export default function Hub() {
  return (
    <Layout location="Hub">
      <main>
        <div className="flex flex-col justify-center gap-2">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Dashboard Main Hub</h2>
          <p className="max-w-4xl grow text-lg font-normal">
            Welcome to the MES Usability Dashboard. This is where you can gain insight into how the users are
            interacting with the platform and get to know whether the platform has any usability issues.
          </p>
        </div>
      </main>
    </Layout>
  );
}
