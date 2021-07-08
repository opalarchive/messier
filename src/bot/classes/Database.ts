import Redis from "ioredis";
import config from "../config";
import { nanoid } from "nanoid";

const redis = new Redis({
  host: "localhost",
  port: 6379,
  username: "messier",
  password: process.env.DB_PASSWORD,
  db: 10,
});

export default redis;

const configPrefixes = config.prefixes;

export async function getGuildConfig(
  guild?: string
): Promise<GuildConfig | undefined> {
  if (!guild) return undefined;

  let guildInfo: GuildConfig;

  guildInfo = await redis.hgetall(getGuildLocation(guild));
  if (!guildInfo.id) {
    redis.hset(getGuildLocation(guild), { id: guild });
    return { id: guild };
  }
  await Promise.all(
    ["disabledCategories", "disabledCmds", "prefixes"].map(
      (el) =>
        new Promise<void>(async (resolve) => {
          guildInfo[el] =
            (await redis.smembers(`${getGuildLocation(guild)}.${el}`)) ||
            undefined;
          if (!(await redis.exists(`${getGuildLocation(guild)}.${el}`)))
            guildInfo[el] = undefined;
          resolve();
        })
    )
  );

  return guildInfo;
}

function getGuildLocation(guild: string) {
  return `messier:config:guilds.${guild}`;
}

export async function addPrefix(guild: string, prefix: string) {
  if (!prefix || prefix.length < 1)
    throw new Error("You need to specify a non-empty prefix!");
  if (prefix.length > 15)
    throw new Error("Prefixes may be at most 15 characters.");
  if (prefix.includes("`") || prefix.includes('"'))
    throw new Error('Prefixes may not contain the character ` or ".');

  const location = `${getGuildLocation(guild)}.prefixes`;

  prefix = prefix.toLowerCase().replace(/\s+/g, " ");

  let prefixes = [...(await getPrefixes(guild))];

  if (prefixes.length >= 5)
    throw new Error("You may only have 5 prefixes for me!");

  if (prefixes.some((el) => el.startsWith(prefix) || prefix.startsWith(el)))
    throw new Error("You can't make a prefix a substring of another prefix.");

  prefixes.push(prefix);

  if (!(await redis.exists(location))) await redis.sadd(location, ...prefixes);
  else await redis.sadd(location, prefix);

  return prefixes;
}

export async function getPrefixes(guild: string): Promise<string[]> {
  const location = `${getGuildLocation(guild)}.prefixes`;

  return (await redis.exists(location))
    ? await redis.smembers(location)
    : configPrefixes;
}

export async function removePrefix(guild: string, prefix: string) {
  prefix = prefix.toLowerCase().replace(/\s+/g, " ");
  const location = `${getGuildLocation(guild)}.prefixes`;

  if (!(await redis.exists(location)))
    await redis.sadd(location, ...configPrefixes);

  if ((await getPrefixes(guild)).length === 1)
    throw new Error("You must have at least one prefix.");

  const remove = await redis.srem(location, prefix);

  if (remove === 0) throw new Error("The prefix was not found.");

  return await redis.smembers(location);
}

export async function resetPrefixes(guild: string): Promise<string[]> {
  await redis.del(`${getGuildLocation(guild)}.prefixes`);

  return configPrefixes;
}

const supportLocation = (uid: string) => `messier:support:tickets.${uid}`;

export async function addReport(user: string, message: string, guild?: string) {
  let uid = nanoid();
  while (await redis.exists(supportLocation(uid))) uid = nanoid();

  const info: { [key: string]: string } = {
    userId: user,
    message,
    timestamp: Date.now().toString(),
  };
  if (guild) info.guild = guild;

  await redis.hset(supportLocation(uid), info);
  await redis.lpush(`messier:support:users.${user}`, uid);

  return uid;
}

export async function getReportForUser(user: string) {
  return (await redis.lrange(`messier:support:users.${user}`, 0, -1)) || [];
}

export async function getReport(uid: string) {
  return await redis.hgetall(supportLocation(uid));
}
