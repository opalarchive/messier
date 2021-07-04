import type { User } from "eris";

export default function tagUser(user: User) {
  return `${user.username}#${user.discriminator}`;
}
