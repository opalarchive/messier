// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { writeFile } from "fs/promises";
import path from "path";

const data = {
  general: {
    help: {
      description:
        "Shows the contest bot help message, or if a command is provided, information about the command.",
      aliases: ["h", "listcmds", "listcommands"],
      usage: "&help [command]",
      arguments: [
        {
          name: "command",
          type: "string",
          optional: true,
        },
      ],
      cooldown: 5000,
      subcommands: {
        dm: {
          description:
            "Gets the main help command sent as a DM, or if a command is provided, information about the command.",
          usage: "&help dm [command]",
          arguments: [
            {
              name: "command",
              type: "string",
              optional: true,
            },
          ],
          cooldown: 10000,
        },
      },
    },
  },
  settings: {
    spamy: {
      description: "Show some information about the bot",
      aliases: ["i", "hi", "hello"],
      usage: "&info",
      cooldown: 5000,
    },
  },
  groupsolve: {
    rama: {
      description: "Show some information about the bot",
      aliases: ["i", "hi", "hello"],
      usage: "&info",
      cooldown: 5000,
    },
  },
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<string>
) {
  await writeFile(
    path.join(process.cwd(), "./commands.json"),
    JSON.stringify(data, null, 2)
  );
  res.status(200).send("Done");
}
