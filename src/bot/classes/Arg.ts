import { splitArgs, isPrivateChannel } from "../utils";
import type { Collection, Message, Role } from "eris";
import type Client from "./Client";

export type ArgTypes = {
  string: (a: string) => string | undefined;
  role: (a: string) => Role | undefined;
};

export type ValidArgs = string | Role;

export default class Args {
  constructor(protected bot: Client) {}

  private findRole(roles: Collection<Role>, args: string[]) {
    let validRoles = roles.filter((el) => !!el),
      name = "",
      arr,
      newName = "";

    for (let i = 0; i < args.length; i++) {
      newName = name.concat(args[i]).toLowerCase();
      arr = validRoles.filter((el) =>
        el.name.toLowerCase().startsWith(newName)
      );

      if (arr.length === 0)
        return name
          ? { roles: validRoles, pos: i }
          : {
              roles: undefined,
              pos: i,
            };
      if (arr.length === 1) return { roles: arr, pos: i };

      validRoles = arr;
    }

    return name
      ? {
          roles: validRoles,
          pos: args.length,
        }
      : {
          roles: undefined,
          pos: 0,
        };
  }

  private async getValue(
    type: string,
    { absorb }: { absorb?: boolean },
    args: string[],
    msg: Message
  ) {
    switch (type) {
      case "string":
        if (absorb)
          return {
            val: args.join(" "),
            pos: args.length,
          };
        return { val: args[0], pos: 0 };
      case "role":
        if (isPrivateChannel(msg.channel)) return { roles: undefined, pos: 0 };
        const roles = msg.guild.roles;
        let role;

        console.log(args[0]);

        if (
          (role = roles.find((el) =>
            [el.id, `<@&${el.id}>`].some((val) => val === args[0])
          ))
        )
          return { val: role, pos: 0 };

        const { roles: validRoles, pos } = this.findRole(roles, args);

        return {
          val: validRoles?.length === 1 ? validRoles[0] : validRoles,
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
      default:
        return "unknown type.";
    }
  }
}
