import type { Client, CommandClient, MessageContent, MessageFile } from "eris";

export default async function sendClientMessage(
  this: Client | CommandClient,
  channelID: string,
  content: MessageContent,
  file?: MessageFile | MessageFile[] | undefined
) {
  if (typeof content === "string") {
    return this.createMessage(
      channelID,
      {
        content,
        allowedMentions: {
          everyone: false,
          repliedUser: false,
          roles: false,
          users: false,
        },
      },
      file
    );
  }

  if (!!content.allowedMentions)
    Object.assign(content.allowedMentions, { everyone: false, roles: false });
  else
    content.allowedMentions = {
      everyone: false,
      repliedUser: false,
      roles: false,
      users: false,
    };

  return this.createMessage(channelID, content, file);
}
