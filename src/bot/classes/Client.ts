import { Client, ClientOptions } from "eris";
import { logger } from "../utils";
import { readdir } from "fs/promises";
import { init } from "@sentry/node";
import config from "../config";
import path from "path";
import Args from "./Arg";
import * as db from "./Database";
import type Command from "./Command";
import type Event from "./Event";
import type { Dirent } from "fs";

export default class BotClient extends Client {
  public log: typeof logger;
  public commands: Command[];
  public events: Event[];
  public config;
  public db;
  public cooldowns: Map<string, Date>;
  public args: Args;
  public logs: BotLogs[];

  constructor(token: string, options: ClientOptions) {
    super(token, options);

    this.log = logger;
    this.commands = [];
    this.events = [];
    this.config = config;
    this.db = db;
    this.cooldowns = new Map();
    this.args = new Args(this);
    this.logs = [];

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

  async loadCommands(path: string, recurse?: boolean) {
    const files = await readdir(path, { withFileTypes: true });

    await Promise.all(
      files.map(async (file: Dirent) => {
        if (file.isDirectory())
          return await this.loadCommands(`${path}/${file.name}`, true);

        let command;
        if (!file.name.endsWith("ts") && !file.name.endsWith("js")) return;

        try {
          const importedCommand = require(`${path}/${file.name}`);
          command = importedCommand[Object.keys(importedCommand)[0]];
        } catch (err) {
          console.log(err);
          this.log.error(err);
        }

        if (!command) return;

        const cmd = new command(
          this,
          file.name.split(/\.(js|ts)$/i)[0],
          path.split("/").last()
        ) as Command;

        return this.commands.push(cmd);
      })
    );

    if (!recurse) this.log.info(`Loaded ${this.commands.length} commands.`);
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
        console.error(err);
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
