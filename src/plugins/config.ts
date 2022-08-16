import { BasePlugin, BaseClient } from ".";

export class ConfigPlugin extends BasePlugin {
  public register(_: BaseClient) {
    _.on("message", async (event) => {
      console.log(event.message, event.source.type);

      if (
        event.message.type === "text" &&
        event.message.text === "!!link" &&
        event.source.type === "group"
      ) {
        await _.line.pushMessage(event.source.groupId, {
          type: "text",
          text: `伺服器 ID: ${event.source.groupId}`,
        });
      }
    });
    _.client.on("messageCreate", async ({ content, author, channel }) => {
      if (author.bot || channel.isDMBased() || channel.isThread()) return;

      if (content.startsWith("!!link")) {
        const args = content.split(" ");
        if (args.length > 1) {
          const [, guildId] = args;

          if (_.getConfigByGuildID(guildId)) {
            channel.send(`${guildId} 該伺服器已被連結過`);

            return;
          }

          await channel
            .createWebhook({ name: "line-discord", reason: "連線至 line" })
            .then((webhook) => {
              console.log(webhook);

              _.createGuildData(channel.id, guildId, webhook.url);
              channel.send("創建成功");
            })
            .catch(() => {
              channel.send("創建失敗\n機器人沒有創建 webhook 的權限");
            });
        } else
          channel.send(
            [
              "請輸入要 Line Guild ID ( ex: !!link 1234567890 )",
              "Line Guild ID 獲取請至 Line Guild 邀請 Bot 加入伺服器並於頻道內輸入 !!link",
            ].join("\n")
          );
      }
    });
  }
}
