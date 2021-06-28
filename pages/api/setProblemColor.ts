import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";
import { getSession } from "next-auth/client";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { id, color } = req.body;
    const session = await getSession({ req });
    if (session) {
      const post = await prisma.problem.upsert({
        select: { color: true, id: true },
        where: {
          userId_id: { id: id, userId: session.id as string },
        },
        update: {
          color,
        },
        create: {
          id,
          color,
          userId: session.id as string,
        },
      });
      res.status(200).json(post);
    } else {
      res.status(401).end();
    }
  } else {
    res.status(405).end("Method not allowed");
  }
}
