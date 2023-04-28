import { z } from 'zod'

export const envVariables = z.object({
  NEXT_PUBLIC_MYSQL_USER: z.string(),
  NEXT_PUBLIC_MYSQL_PASSWORD: z.string(),
  NEXT_PUBLIC_MYSQL_DATABASE: z.string(),
})

envVariables.parse(process.env)
