import Head from 'next/head';

type Props = {
  location: string;
};

export default function Seo({ location }: Props) {
  const description = 'A dashboard for comprehensive display of usability metrics';
  const title = `${location} | CMF MES UX Dashboard`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
