interface GuildConfig {
  betaGuild?: boolean;
  disabledCategories?: string[];
  disabledCmds?: string[];
  channelList?: string[];
  channelDefaultDisable?: boolean;
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
