import React from 'react';
import { Layout } from '../components/layout';
import { MouseClicksViz } from '../components/viz';

export default function Mouse() {
  return (
    <Layout location="Mouse">
      <main>
        <article className="flex flex-col justify-center gap-1">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Mouse clicks</h1>
          <p className="mb-2 max-w-4xl grow text-lg font-normal">
            Delve into how your users are behaving and inspect the data collected from the user mouse clicks.
          </p>
          <MouseClicksViz />
        </article>
      </main>
    </Layout>
  );
}
