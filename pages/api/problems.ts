import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { getSession } from 'next-auth/client'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (session) {
    const posts = await prisma.problem.findMany({where: {userId: {equals: session?.id as string}}})
    res.json(posts)
  } else {
    res.status(401)
  }
  res.end()
}