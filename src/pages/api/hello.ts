// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "fs/promises";
import path from "path";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const body = await readFile(
    path.join(process.cwd(), "./commands.json"),
    "utf8"
  );
  console.log("SFDHUOSHFD");
  res.status(200).send(JSON.stringify(body, null, 2));
}
