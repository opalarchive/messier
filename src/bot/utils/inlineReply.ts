import type { Message, MessageContent, MessageFile } from "eris";

export default async function inlineReply(
  this: Message,
  content: MessageContent,
  mentionUser?: boolean,
  file?: MessageFile | MessageFile[] | undefined
) {
  if (typeof content === "string") {
    return this.channel.createMessage(
      {
        content,
        messageReference: { messageID: this.id },
        allowedMentions: {
          everyone: false,
          repliedUser: !!mentionUser,
          roles: false,
          users: false,
        },
      },
      file
    );
  }

  Object.assign(content, { messageReference: { messageID: this.id } });
  if (!!content.allowedMentions && mentionUser !== undefined)
    Object.assign(content.allowedMentions, { repliedUser: mentionUser });
  else
    content.allowedMentions = {
      everyone: false,
      repliedUser: !!mentionUser,
      roles: false,
      users: false,
    };

  return this.channel.createMessage(content, file);
}
