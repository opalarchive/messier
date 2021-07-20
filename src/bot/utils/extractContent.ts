import type { Message } from "eris";

export default function extractContent(msg: Message, isIndex: boolean = false) {
  let content = msg.originalContent.trim();

  content = content.substring(content.indexOf(msg.prefix || ""));
  content = content.substring(content.regexIndexOf(/\s/) + 1);
  if (!isIndex) content = content.substring(content.regexIndexOf(/\s/) + 1);
  return content;
}
