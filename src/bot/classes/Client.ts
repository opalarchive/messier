import { Client, ClientOptions } from "eris";
import { logger } from "../utils";
import { readdir } from "fs/promises";
import { init } from "@sentry/node";
import config from "../config";
import path from "path";
import Args from "./Arg";
import * as db from "./Database";
import Interaction from "./Interaction";
import type { Command, SubCommand } from "./Command";
import type Event from "./Event";
import type { Dirent } from "fs";

export default class BotClient extends Client {
  public log: typeof logger;
  public categories: Map<string, Set<string>>;
  public commands: Map<string, Command | string>;
  public commandInfo: { [key: string]: number } = {};
  public subcommands: Map<string, Map<string, SubCommand | string>>;
  public events: Event[];
  public config;
  public db;
  public cooldowns: Map<string, Date>;
  public logs: BotLogs[];
  public args: Args;
  public interactions: Interaction;

  constructor(token: string, options: ClientOptions) {
    super(token, options);

    this.log = logger;
    this.commands = new Map();
    this.subcommands = new Map();
    this.events = [];
    this.config = config;
    this.db = db;
    this.args = new Args(this);
    this.cooldowns = new Map();
    this.categories = new Map();
    this.logs = [];
    this.interactions = new Interaction(this);

    try {
      init(config.sentry);
    } catch (err) {
      this.log.error(err);
    }

    this.connect();
    this.editStatus("idle", {
      type: 0,
      name: "Booting Up!",
    });

    this.once("ready", async () => this.load());
  }

  async loadCommand(path: string, category: string) {
    const files = await readdir(path, { withFileTypes: true });

    const main = files.find(
      (file) => file.name === "index.ts" || file.name === "index.js"
    );

    if (!main) {
      const err = `Main command for ${path} was not found.`;

      return this.log.error(err);
    }

    const importedCommand = require(`${path}/${main.name}`);
    let command = importedCommand.default;

    const cmd = new command(
      this,
      path.split("/").last()?.toLowerCase(),
      category
    ) as Command;

    this.commands.set(cmd.name, cmd);
    this.categories.set(
      category,
      this.categories.get(category)?.add(cmd.name) ||
        new Set<string>().add(cmd.name)
    );

    const mainCommandName = cmd.name;

    this.commandInfo[category]++;

    cmd.aliases
      ?.map((el) => el.toLowerCase())
      .filter((el) => el !== cmd.name)
      .forEach((alias: string) => this.commands.set(alias, cmd.name));

    Object.keys(cmd.interactions).map((el) =>
      this.interactions.setComponentInteraction(el, cmd.interactions[el])
    );

    files.forEach((file: Dirent) => {
      if (file.isDirectory()) return;
      if (file.name === main.name) return;

      let command;
      if (!file.name.endsWith("ts") && !file.name.endsWith("js")) return;

      try {
        const importedCommand = require(`${path}/${file.name}`);
        command = importedCommand.default;
      } catch (err) {
        this.log.error(err);
      }

      if (!command) return;

      const cmd = new command(
        this,
        file.name.split(/\.(js|ts)$/i)[0],
        category
      ) as SubCommand;

      const map = this.subcommands.get(mainCommandName) || new Map();

      map.set(cmd.name, cmd);

      cmd.aliases
        ?.map((el) => el.toLowerCase())
        .filter((el) => el !== cmd.name)
        .forEach((alias: string) => this.commands.set(alias, cmd.name));

      Object.keys(cmd.interactions).map((el) =>
        this.interactions.setComponentInteraction(el, cmd.interactions[el])
      );

      this.subcommands.set(mainCommandName, map);
    });

    return this.commandInfo.total++;
  }

  async loadCommands(path: string, recurse?: boolean) {
    const files = await readdir(path, { withFileTypes: true });
    this.commandInfo.total = 0;

    await Promise.all(
      files.map(async (file: Dirent) => {
        if (file.isDirectory()) {
          if (!recurse) {
            this.commandInfo[file.name || ""] = 0;
            return await this.loadCommands(`${path}/${file.name}`, true);
          }
          return this.loadCommand(
            `${path}/${file.name}`,
            path.split("/").last() || ""
          );
        }

        const main = files.find(
          (file) => file.name === "index.ts" || file.name === "index.js"
        );

        if (!main) throw new Error(`Main command for ${path} was not found.`);

        const importedCommand = require(`${path}/${main.name}`);
        let command = importedCommand.default;

        this.commandInfo[path.split("/").reverse()[1] || ""]++;

        const cmd = new command(
          this,
          main.name.split(/\.(js|ts)$/i)[0],
          path.split("/").reverse()[1]
        ) as Command;

        this.commands.set(cmd.name, cmd);
        this.categories.set(
          path.split("/").reverse()[1],
          this.categories.get(path.split("/").reverse()[1])?.add(cmd.name) ||
            new Set<string>().add(cmd.name)
        );

        command.aliases?.forEach((alias: string) =>
          this.commands.set(alias, cmd.name)
        );

        Object.keys(cmd.interactions).map((el) =>
          this.interactions.setComponentInteraction(el, cmd.interactions[el])
        );

        this.commandInfo.total++;
      })
    );

    if (!recurse) this.log.info(`Loaded ${this.commandInfo.total} commands.`);
  }

  async loadEvents(path: string) {
    const bot = this;

    const files = await readdir(path, { withFileTypes: true });

    files.forEach((file: Dirent) => {
      if (file.isDirectory()) return;

      let event;
      if (!file.name.endsWith("js") && !file.name.endsWith("ts")) return;

      try {
        const importedEvent = require(`${path}/${file.name}`);
        event = importedEvent[Object.keys(importedEvent)[0]];
      } catch (err) {
        bot.log.error(`Event ${file.name} failed to load: ${err}`);
      }

      if (!event) return;

      // Pushes the events and runs them
      this.events.push(new event(bot, file.name.split(/\.(js|ts)$/i)[0]));
    });

    this.events.forEach((e: Event) => {
      e.events.forEach((ev: string) => {
        bot.on(ev, (...eventParams: string[]) => e.run(ev, ...eventParams));
      });
    });

    this.log.info(`Loaded ${this.events.length} events.`);
  }

  async load() {
    await Promise.all([
      this.loadEvents(path.join(__dirname, "../events")),
      this.loadCommands(path.join(__dirname, "../commands")),
    ]);
    await this.editStatus("online", {
      type: 2,
      name: "&help",
    });
    this.log.info("Loaded and ready to accept commands.");
  }
}
