import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

const safeParse = (content: string) => {
  try {
    return JSON.parse(content);
  } catch (e) {
    return undefined;
  }
};

type ClientConfig = {
  defaultLocale: string;
  homepage: string;
  prefixes: string[];
  token: string;
  owners: string[];
  sentry: {
    dsn: string;
    environment: string;
    release?: string;
    tracesSampleRate: number;
    maxBreadcrumbs: number;
    attachStacktrace: boolean;
  };
  eris: {
    compress: boolean;
    defaultImageFormat: string;
    defaultImageSize: number;
    getAllUsers: boolean;
    maxShards: number;
    intents: string[];
  };
};

const clientConfig: ClientConfig = {
  defaultLocale: "en",
  homepage: "https://messier.dev",
  prefixes: safeParse(process.env.DISCORD_PREFIXES || "") || ["&"],
  token: process.env.DISCORD_BOT_TOKEN || "",
  owners: ["446065841172250638"],
  sentry: {
    dsn: process.env.SENTRY_DSN || "",
    environment: process.env.NODE_ENV,
    release: process.env.npm_package_version,
    tracesSampleRate: 1.0,
    maxBreadcrumbs: 50,
    attachStacktrace: true,
  },
  eris: {
    compress: true,
    defaultImageFormat: "png",
    defaultImageSize: 512,
    getAllUsers: false,
    maxShards: 1,
    intents: [
      "directMessageReactions",
      "directMessages",
      "guildMessageReactions",
      "guildMessages",
      "guilds",
    ],
  },
};
export default clientConfig;
