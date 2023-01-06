import Head from 'next/head'

type Props = {
  location: string
  description?: string
}

export default function HeadComponent({ location, description }: Props) {
  const website = process.env.NEXT_PUBLIC_WEBSITE_NAME!
  const fallbackDescription = 'A dashboard for comprehensive display of usability metrics'
  const title = [location, website].join(' | ')

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description || fallbackDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  )
}
