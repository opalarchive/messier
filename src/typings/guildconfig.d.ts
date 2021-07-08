interface GuildConfig {
  betaGuild?: boolean;
  disabledCategories?: string[];
  disabledCmds?: string[];
  id?: string;
  guildLocale?: string;
  prefixes?: string[];
  staffRole?: string;
}

interface BlacklistInfo {
  guild?: boolean;
  id?: string;
  reason?: string;
  user?: boolean;
}
