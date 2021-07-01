interface GuildConfig {
  betaGuild?: boolean;
  disabledCategories?: string[];
  disabledCmds?: string[];
  id?: string;
  guildLocale?: string;
  prefixes?: string[];
  staffRole?: string;
  verifiedRole?: string;
}

interface BlacklistInfo {
  guild?: boolean;
  id?: string;
  reason?: string;
  user?: boolean;
}
