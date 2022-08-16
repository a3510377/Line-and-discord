import { BasePlugin, BaseClient } from ".";

export class LineBot extends BasePlugin {
  public registerEvents(_: BaseClient) {
    _.client.on("messageCreate", async (event) => {
      const { channel, reference, author } = event;

      const lineGuildId = _.getChannelData(channel.id);
      if (
        !lineGuildId ||
        channel.isDMBased() ||
        author.id !== _.client.user?.id
      )
        return;

      _.line.pushMessage(lineGuildId, {
        type: "text",
        text: "awa",
      });

      // if (event.channelId !== process.env.DISCORD_CHANNEL_ID || author.bot)
      //   return;

      let content = event.content;

      if (reference?.messageId) {
        const referenceMsg = await channel.messages.fetch(reference.messageId);
        if (referenceMsg) {
          content = `${referenceMsg.content || "..."} > ${content}`;
        }
      }
    });
  }
}
