import { BasePlugin, BaseClient } from ".";

export default class ConfigPlugin extends BasePlugin {
  public check_ids: {
    channel: string;
    guild: string;
    webhook: string;
  }[] = [];
  public register(_: BaseClient) {
    _.on("message", async (event) => {
      if (event.message.type !== "text" || event.source.type !== "group")
        return;

      const {
        source: { groupId },
      } = event;

      const args = event.message.text.trim().split(" ");
      const commandName = args.shift();
      if (!commandName) return;

      if (commandName === "!!link") {
        await _.line.pushMessage(groupId, {
          type: "text",
          text: `伺服器 ID: ${groupId}`,
        });
      } else if (commandName.startsWith("!!link")) {
        const [type, text] = args;
        if (type === "check" && text) {
          const data = this.check_ids.find(
            (_) => _.channel === text && _.guild === groupId
          );
          if (!data) {
            _.line.pushMessage(groupId, {
              type: "text",
              text: "確認數據過期或不存在\n請於 discord channel 中取得新的確認數據 ( !!link <guild id> )",
            });
          } else {
            _.createGuildData(data.channel, data.guild, data.webhook);
            _.line.pushMessage(groupId, {
              type: "text",
              text: `確認完畢:\n${data.guild} -> ${data.channel}\n${data.guild} <- ${data.channel}`,
            });
          }
        }
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

              channel.send(
                `創建成功\n請於 5 分鐘內於 Line 上發送 \`!!link check ${channel.id}\``
              );
              this.check_ids.push({
                channel: channel.id,
                guild: guildId,
                webhook: webhook.url,
              });

              setTimeout(() => {
                this.check_ids = this.check_ids.filter((check) => {
                  const {
                    guild,
                    channel: channelId,
                    webhook: webhookUrl,
                  } = check;

                  return (
                    channelId !== channel.id &&
                    webhookUrl !== webhook.url &&
                    guild !== guildId
                  );
                });
              }, 1e3 * 60 * 5); // 5 minutes
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
