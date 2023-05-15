import React from 'react';
import { Layout } from '../components/layout';
import { PageVisitsViz } from '../components/viz';

export default function Visits() {
  return (
    <Layout location="Visits">
      <main>
        <article className="flex flex-col justify-center gap-1">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Site visits</h1>
          <p className="mb-2 max-w-4xl grow text-lg font-normal">
            Delve into how your users are behaving and inspect the data collected from the page visits and its linked
            data from the sessions.
          </p>
        </article>
        <PageVisitsViz />
      </main>
    </Layout>
  );
}
