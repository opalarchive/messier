import type {
  AnyChannel,
  Member,
  Message,
  Role,
  TextChannel,
  User,
} from "eris";

export interface ArgTypes {
  boolean: {
    (a: string, msg: Message, flag?: ["strict"]): boolean | undefined;
  };

  channel: {
    (a: string, msg: Message<TextChannel>, flag?: "fallback"[]):
      | AnyChannel
      | undefined;
  };

  channelArray: {
    (a: string[], msg: Message<TextChannel>): string[] | "No channels";
  };

  member: {
    (
      a: string,
      msg: Message<TextChannel>,
      flag?: ("fallback" | "userFallback" | "strict")[]
    ): Member | Promise<User | undefined> | User | undefined;
  };

  number: {
    (a: number, msg: Message<TextChannel>, flag?: ["negative"]):
      | number
      | undefined;
  };

  role: {
    (a: string, msg: Message<TextChannel>, flag?: string[]): Role | undefined;
  };

  roleArray: {
    (a: string[], msg: Message<TextChannel>): string[] | undefined;
  };

  string: {
    (a: string): string;
  };

  user: {
    (a: string, msg?: Message<TextChannel>, flag?: ["REST"]):
      | Promise<User | undefined>
      | User
      | undefined;
  };
}

export interface ParsedArgs {
  flag: string | string[] | undefined;
  name: string;
  optional: boolean;
  type: string;
  value?: any;
}
