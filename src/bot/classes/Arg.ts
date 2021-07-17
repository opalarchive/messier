import { splitArgs, isPrivateChannel } from "../utils";
import type { Channel, Collection, Message, Role } from "eris";
import type Client from "./Client";

export type ArgTypes = {
  string: (a: string) => string | undefined;
  role: (a: string) => Role | undefined;
  channel: (a: string) => Channel | undefined;
};

export type ValidArgs = string | Role | Channel;
export default class Args {
  constructor(protected bot: Client) {}

  private findObject(
    vals: Collection<{ name: string; id: string | number }>,
    args: string[]
  ) {
    let validValues = vals.filter((el) => !!el),
      name = "",
      arr,
      newName = "";

    for (let i = 0; i < args.length; i++) {
      newName = name.concat(args[i]).toLowerCase();
      arr = validValues.filter((el) =>
        el.name.toLowerCase().startsWith(newName)
      );

      if (arr.length === 0)
        return name
          ? { vals: validValues, pos: i }
          : {
              vals: undefined,
              pos: i,
            };
      if (arr.length === 1) return { vals: arr, pos: i };

      validValues = arr;
    }

    return name
      ? {
          vals: validValues,
          pos: args.length,
        }
      : {
          vals: undefined,
          pos: 0,
        };
  }

  private async getValue(
    type: string,
    { absorb }: { absorb?: boolean },
    args: string[],
    msg: Message
  ) {
    if (type === "string") {
      if (absorb)
        return {
          val: args.join(" "),
          pos: args.length,
        };
      return { val: args[0], pos: 0 };
    } else if (type === "role") {
      if (isPrivateChannel(msg.channel)) return { roles: undefined, pos: 0 };
      const roles = msg.guild.roles;
      let role;

      if (
        (role = roles.find((el) =>
          [el.id, `<@&${el.id}>`].some((val) => val === args[0])
        ))
      )
        return { val: role, pos: 0 };

      const { vals: validValues, pos } = this.findObject(roles, args);

      return {
        val: validValues?.length === 1 ? validValues[0] : validValues,
        pos,
      };
    } else if (type === "channel") {
      if (isPrivateChannel(msg.channel)) return { channel: undefined, pos: 0 };
      const channels = msg.guild.channels;
      let channel;

      if (
        (channel = channels.find((el) =>
          [el.id, `<#${el.id}>`].some((val) => val === args[0])
        ))
      )
        return { val: channel, pos: 0 };

      const { vals: validValues, pos } = this.findObject(channels, args);

      return {
        val: validValues?.length === 1 ? validValues[0] : validValues,
        pos,
      };
    }

    return { val: undefined, pos: 0 };
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
  ): Promise<Map<string, ValidArgs | undefined>> {
    let argsArr = splitArgs(args);
    const map: Map<string, ValidArgs | undefined> = new Map();

    for (const el of cmdArgs) {
      const val = await this.getValue(
        el.type,
        { absorb: el.absorb },
        argsArr,
        msg
      );
      argsArr = argsArr.splice(0, val.pos);
      map.set(el.name, val.val as any);
    }

    return map;
  }

  getInfo(type: ValidArgs) {
    switch (type) {
      case "string":
        return "characters separated by whitespace (allowing for quotations).";
      case "role":
        return "a discord role, which can be by ID or mention (preferred) or string.";
      default:
        return "unknown type.";
    }
  }
}
