export {};

const { readdir, writeFile } = require("fs/promises");
import Client from "./bot/classes/Client";
const path = require("path");

import type { Dirent } from "fs";

let commands = {};
let client = new Client("", { intents: 0 });

if (!Array.prototype.last) {
  Array.prototype.last = function () {
    if (!this.length) {
      return undefined;
    }
    return this[this.length - 1];
  };
}

async function loadCommand(path: string, category: string) {
  const files = await readdir(path, { withFileTypes: true });

  const main = files.find(
    (file: Dirent) => file.name === "index.ts" || file.name === "index.js"
  );

  if (!main) {
    const err = `Main command for ${path} was not found.`;

    console.error(err);
    return;
  }

  const importedCommand = require(`${path}/${main.name}`);
  let command = importedCommand.default;

  const cmd = new command(
    client,
    path.split("/").last()?.toLowerCase(),
    category
  );

  const mainCommandName = cmd.name;

  if (cmd.owner) return;

  commands[category][cmd.name] = {
    aliases: cmd.aliases,
    arguments: cmd.args,
    description: cmd.description,
    cooldown: cmd.cooldown || 0,
    staff: cmd.staff,
  };

  commands[category][mainCommandName].subcommands = {};

  files.forEach((file: Dirent) => {
    if (file.isDirectory()) return;
    if (file.name === main.name) return;

    if (file.name === main.name) return;

    let command;
    if (!file.name.endsWith("ts") && !file.name.endsWith("js")) return;

    try {
      const importedCommand = require(`${path}/${file.name}`);
      command = importedCommand.default;
    } catch (err) {
      console.error(err);
    }

    if (!command) return;

    const cmd = new command(
      client,
      file.name.split(/\.(js|ts)$/i)[0],
      category
    );

    if (cmd.owner) return;

    commands[category][mainCommandName].subcommands[cmd.name] = {
      aliases: cmd.aliases,
      description: cmd.description,
      arguments: cmd.args,
      cooldown: cmd.cooldown,
      staff: cmd.staff,
    };
  });
}

async function loadCommands(path: string, recurse?: boolean) {
  const files = await readdir(path, { withFileTypes: true });

  await Promise.all(
    files.map(async (file: Dirent) => {
      if (file.isDirectory()) {
        if (!recurse) {
          return await loadCommands(`${path}/${file.name}`, true);
        }
        commands[path.split("/").last() || ""] = {};
        return loadCommand(
          `${path}/${file.name}`,
          path.split("/").last() || ""
        );
      }

      const main = files.find(
        (file: Dirent) => file.name === "index.ts" || file.name === "index.js"
      );

      if (!main) throw new Error(`Main command for ${path} was not found.`);

      const importedCommand = require(`${path}/${main.name}`);
      let command = importedCommand.default;

      const cmd = new command(
        client,
        main.name.split(/\.(js|ts)$/i)[0],
        path.split("/").reverse()[1]
      );

      if (cmd.owner) return;

      commands[cmd.category][cmd.name] = {
        aliases: cmd.aliases,
        arguments: cmd.args,
        description: cmd.description,
        cooldown: cmd.cooldown,
        staff: cmd.staff,
      };
    })
  );
}

loadCommands(path.join(process.cwd(), "./src/bot/commands"))
  .then(() =>
    writeFile(
      path.join(process.cwd(), "./commands.json"),
      JSON.stringify(commands, null, 2)
    )
  )
  .then(() => console.log("Loaded up commands.json"))
  .then(() => process.exit());
