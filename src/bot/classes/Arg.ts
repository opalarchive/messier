import { splitArgs } from "../utils";
import type { Message } from "eris";
import type Client from "./Client";

export type ArgTypes = {
  string: (a: string) => string | undefined;
};

export type ValidArgs = string;

export default class Args {
  public argtypes: ArgTypes;

  constructor(protected bot: Client) {
    this.argtypes = {
      string: (a) => a,
    };
  }

  async parse(
    cmdArgs: {
      name: string;
      type: string;
      optional?: boolean;
      absorb?: boolean;
    }[],
    args: string,
    msg: Message
  ): Promise<Map<string, ValidArgs>> {
    const argsArr = splitArgs(args);
    const map: Map<string, ValidArgs> = new Map();

    let idx = 0;

    argsArr.forEach((arg: string) => {
      const argument = cmdArgs[idx];

      // Handles argument flags
      if (!arg) return;

      idx++;

      if (!argument) {
        if (cmdArgs.last()?.absorb && cmdArgs.last()?.type === "string") {
          const name = cmdArgs.last()?.name;
          if (!name) return;
          map.set(name, map.get(name)?.concat(" ").concat(arg) || arg);
        }
        return;
      }

      // Gets the argtype
      const value = this.argtypes[argument.type](
        arg.toLowerCase(),
        msg,
        this.bot
      );
      if (typeof value == "undefined") return;

      map.set(argument.name, value);
    });
    return map;
  }

  getInfo(type: ValidArgs) {
    switch (type) {
      case "string":
        return "characters separated by whitespace (allowing for quotations).";
      default:
        return "unknown type.";
    }
  }
}
