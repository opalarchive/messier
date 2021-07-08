import type {
  APIGuildMember,
  APIMessageComponentInteraction,
} from "discord-api-types/payloads";
import type {
  TextChannel,
  Message,
  MessageContent,
  MessageFile,
  TextChannel,
  Guild,
  Message,
  AdvancedMessageContent,
} from "eris";

declare module "eris" {
  export interface Message {
    inlineReply: (
      content: MessageContent,
      mentionUser?: boolean,
      file?: MessageFile | MessageFile[] | undefined
    ) => Promise<Message>;
    guild: Guild;
    originalContent?: typeof Message.content;
  }

  export interface Textable {
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

  type InteractionPayload = Omit<
    WebhookPayload,
    "auth" | "avatarURL" | "username" | "wait"
  > & { flags?: number };
  type InteractionCallbackType = 1 | 4 | 5 | 6 | 7;

  interface Client {
    createInteractionResponse(
      id: string,
      token: string,
      type: InteractionCallbackType,
      content?: InteractionPayload
    ): Promise<void>;
    getOriginalInteractionResponse(
      applicationId: string,
      token: string
    ): Promise<Message<GuildTextableChannel>>;
    editOriginalInteractionResponse(
      applicationId: string,
      token: string,
      content: InteractionPayload
    ): Promise<void>;
    deleteOriginalInteractionResponse(
      applicationId: string,
      token: string
    ): Promise<void>;

    createFollowupMessage(
      applicationId: string,
      token: string,
      content: InteractionPayload
    ): Promise<void>;
    editFollowupMessage(
      applicationId: string,
      token: string,
      messageId: string,
      content: InteractionPayload
    ): Promise<void>;
    deleteFollowupMessage(
      applicationId: string,
      token: string,
      messageId: string
    ): Promise<void>;
    // just for internal use
    private _formatAllowedMentions(allowed: AllowedMentions): unknown;
  }

  export interface TextChannel {
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

declare module "discord-api-types/payloads" {
  export interface APIDMMessageComponentInteraction
    extends APIMessageComponentInteraction {
    user: APIUser;
  }

  export interface APIGuildMessageComponentInteraction
    extends APIMessageComponentInteraction {
    member: APIGuildMember;
  }
}
