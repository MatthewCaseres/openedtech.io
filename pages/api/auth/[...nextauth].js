import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    }),
    // ...add more providers here
  ],
  adapter: PrismaAdapter(prisma),

  // A database is optional, but required to persist accounts in a database
  database: process.env.DATABASE_URL,
})