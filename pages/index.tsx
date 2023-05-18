import React from 'react';
import Layout from '../components/layout/Layout';

export default function Hub() {
  return (
    <Layout location="Hub">
      <article>
        <div className="flex flex-col justify-center gap-2">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Dashboard Main Hub</h2>
          <p className="max-w-4xl grow text-lg font-normal">
            Welcome to the MES Usability Dashboard. This is where you can gain insight into how the users are
            interacting with the platform and get to know whether the platform has any usability issues.
          </p>
        </div>

        <div></div>
      </article>
    </Layout>
  );
}

function Ola() {
  const [data, setData] = React.useState<any>([]);
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [willFetch, setWillFetch] = React.useState<boolean>(true);

  // fetch data from API
  React.useEffect(() => {
    if (!willFetch) return;

    fetch('/api/matomo/entry-pages')
      .then((res) => {
        if (!res.ok) {
          setError(true);
          setLoading(false);
          setWillFetch(false);
          return null;
        } else {
          return res.json();
        }
      })
      .then((data: any) => {
        setLoading(false);
        setWillFetch(false);
        setData(data === null ? [] : data);
      });
  }, [willFetch]);

  return (
    <div>
      <div></div>
    </div>
  );
}
