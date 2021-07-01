import type {
  TextChannel,
  Message,
  MessageContent,
  MessageFile,
  TextChannel,
  Guild,
} from "eris";

declare module "eris" {
  export interface Message {
    inlineReply: (
      content: MessageContent,
      mentionUser?: boolean,
      file?: MessageFile | MessageFile[] | undefined
    ) => Promise<Message>;
    guild: Guild;
  }

  export interface TextChannel {
    sendMessage: typeof TextChannel.createMessage;
    awaitMessage: (
      filter?: (message: Message) => boolean,
      options?: { maximum?: number; time?: number }
    ) => Promise;
    sendCode: (
      content: MessageContent,
      language: string = "",
      file?: MessageFile | MessageFile[] | undefined
    ) => Promise<Message>;
  }

  export interface GroupChannel {
    sendMessage: typeof GroupChannel.createMessage;
    awaitMessage: (
      filter?: (message: Message) => boolean,
      options?: { maximum?: number; time?: number }
    ) => Promise;
    sendCode: (
      content: MessageContent,
      language: string = "",
      file?: MessageFile | MessageFile[] | undefined
    ) => Promise<Message>;
  }

  export interface NewsChannel {
    sendMessage: typeof NewsChannel.createMessage;
    awaitMessage: (
      filter?: (message: Message) => boolean,
      options?: { maximum?: number; time?: number }
    ) => Promise;
    sendCode: (
      content: MessageContent,
      language: string = "",
      file?: MessageFile | MessageFile[] | undefined
    ) => Promise<Message>;
  }

  export interface PrivateChannel {
    sendMessage: typeof PrivateChannel.createMessage;
    awaitMessage: (
      filter?: (message: Message) => boolean,
      options?: { maximum?: number; time?: number }
    ) => Promise;
    sendCode: (
      content: MessageContent,
      language: string = "",
      file?: MessageFile | MessageFile[] | undefined
    ) => Promise<Message>;
  }

  export interface Client {
    sendMessage: typeof Client.createMessage;
  }

  export interface CommandClient {
    sendMessage: typeof CommandClient.createMessage;
  }
}
