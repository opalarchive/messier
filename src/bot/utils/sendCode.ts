import type {
  TextChannel,
  GroupChannel,
  NewsChannel,
  PrivateChannel,
  MessageContent,
  MessageFile,
} from "eris";

export default async function sendMessage(
  this: TextChannel | GroupChannel | NewsChannel | PrivateChannel,
  content: MessageContent,
  language: string = "",
  file?: MessageFile | MessageFile[] | undefined
) {
  if (typeof content === "string") {
    return this.createMessage(
      {
        content: `\`\`\`${language}\n${content}\n\`\`\``,
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

  content.content = `\`\`\`${language}\n${content.content}\n\`\`\``;

  return this.createMessage(content, file);
}
