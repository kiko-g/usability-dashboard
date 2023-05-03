import { z } from "zod"

export const envVariables = z.object({
  NEXT_PUBLIC_MYSQL_USER: z.string(),
  NEXT_PUBLIC_MYSQL_PASSWORD: z.string(),
  NEXT_PUBLIC_MYSQL_DATABASE: z.string(),
  NEXT_PUBLIC_MATOMO_TOKEN: z.string(),
  NEXT_PUBLIC_MATOMO_SITE_ID: z.string(),
  NEXT_PUBLIC_MATOMO_SITE_URL: z.string(),
})

envVariables.parse(process.env)
