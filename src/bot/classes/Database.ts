import Redis from "ioredis";

const redis = new Redis({
  host: "localhost",
  port: 6379,
  username: "messier",
  password: process.env.DB_PASSWORD,
  db: 10,
});

export default redis;

export async function getGuildConfig(
  guild?: string
): Promise<GuildConfig | undefined> {
  if (!guild) return undefined;

  let guildInfo: GuildConfig;

  guildInfo = await redis.hgetall(`guilds.${guild}`);
  if (!guildInfo.id) {
    redis.hset(`guilds.${guild}`, { id: guild });
    return { id: guild };
  }
  await Promise.all(
    ["disabledCategories", "disabledCmds", "prefixes"].map(
      (el) =>
        new Promise<void>(async (resolve) => {
          guildInfo[el] =
            (await redis.smembers(`guilds.${guild}.${el}`)) || undefined;
          if (!(await redis.exists(`guilds.${guild}.${el}`)))
            guildInfo[el] = undefined;
          resolve();
        })
    )
  );

  return guildInfo;
}
