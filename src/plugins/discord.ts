import { BasePlugin, BaseClient } from ".";

export class DiscordPlugin extends BasePlugin {
  public register(_: BaseClient) {
    _.client.on("ready", (bot) => {
      console.log(`Discord bot ${bot.user.username} is ready.`);
    });
    _.client.on("messageCreate", async (msg) => {
      const { channel, reference, member, author } = msg;

      const config = _.getConfigByChannelID(channel.id);

      if (
        !config ||
        channel.isDMBased() ||
        author.id === _.client.user?.id ||
        msg.webhookId
      )
        return;

      const { guildId } = config;

      let content = msg.content;

      if (reference?.messageId) {
        const referenceMsg = await channel.messages.fetch(reference.messageId);

        if (referenceMsg) {
          content =
            ((referenceMsg.member?.nickname || referenceMsg.author.username) +
              `-${referenceMsg.content}` || "...") + ` > ${content}`;
        }
      }

      _.line.pushMessage(guildId, {
        type: "text",
        text: `${member?.nickname || author.username}:\n${content}`,
      });
    });
  }
}
