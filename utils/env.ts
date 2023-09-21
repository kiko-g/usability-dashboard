import { z } from 'zod'

const envVariables = z.object({
  MATOMO_TRUSTED_HOSTS: z.string(),
  MATOMO_DATABASE_HOST: z.string(),
  MATOMO_DATABASE_DBNAME: z.string(),
  MATOMO_DATABASE_USERNAME: z.string(),
  MATOMO_DATABASE_PASSWORD: z.string(),
  MATOMO_DATABASE_TABLES_PREFIX: z.string(),
  MATOMO_DATABASE_ADAPTER: z.string(),

  MYSQL_ROOT_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string(),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string(),
  PMA_HOST: z.string(),

  PORT: z.number(),
  NEXT_PUBLIC_MYSQL_USER: z.string(),
  NEXT_PUBLIC_MYSQL_PASSWORD: z.string(),
  NEXT_PUBLIC_MYSQL_DATABASE: z.string(),
  NEXT_PUBLIC_MATOMO_TOKEN: z.string(),
  NEXT_PUBLIC_MATOMO_SITE_ID: z.number(),
  NEXT_PUBLIC_MATOMO_SITE_URL: z.string(),
  NEXT_PUBLIC_MATOMO_DASHBOARD_URL: z.string(),
})

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

const env = envVariables.parse(process.env)

export { env }
