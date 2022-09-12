import { Message } from "@line/bot-sdk";
import { TextChannel } from "discord.js";
import { BasePlugin, BaseClient } from ".";

export default class DiscordPlugin extends BasePlugin {
  public register(_: BaseClient) {
    _.client.on("messageCreate", async (msg) => {
      const {
        channelId,
        channel: channel_,
        reference,
        member,
        author,
        guild,
      } = msg;
      if (!guild || !channel_.isTextBased() || !channel_.isDMBased()) return;

      const channel = <TextChannel>guild.channels.cache.get(channelId) || {
        name: "unknown",
        ...channel_,
      };

      const config = _.getConfigByChannelID(channel.id);
      const msgList: Message[] = [];
      const sender = {
        name: member?.nickname || author.username,
        iconUrl: author.avatarURL()?.replace(/\.webp$/, ".png") || void 0,
      };

      if (!config || author.id === _.client.user?.id || msg.webhookId) return;

      const { guildId } = config;

      let content = msg.content;

      if (reference?.messageId) {
        const referenceMsg = await channel.messages.fetch(reference.messageId);

        if (referenceMsg) {
          const userName =
            referenceMsg.member?.nickname || referenceMsg.author.username;
          content = [
            `${userName}-${referenceMsg.content}`,
            referenceMsg.attachments.size > 0
              ? " ( attachments in message... )"
              : "",
            ` > ${content}`,
          ].join("");
        }
      }

      if (content) msgList.push({ type: "text", text: content });

      msg.attachments.each(async ({ contentType, url }) => {
        if (!contentType) return msgList.push({ type: "text", text: url });

        if (/^(image|video)\//.test(contentType)) {
          msgList.push({
            type: contentType.startsWith("image/") ? "image" : "video",
            previewImageUrl: url,
            originalContentUrl: url,
          });
        } else if (contentType === "audio/m4a") {
          msgList.push({
            type: "audio",
            originalContentUrl: url,
            duration: 0,
          });
        } else msgList.push({ type: "text", text: url });
      });

      if (msgList.length <= 0) return;

      console.log(
        `${channel.name}-${author.username} > ${guildId}`,
        JSON.stringify(msgList)
      );

      _.line
        .pushMessage(
          guildId,
          msgList.map((msg) => ({ sender, ...msg }))
        )
        .catch(() => {
          console.log("push failed");

          _.line.pushMessage(
            guildId,
            msgList.map((msg) => {
              if (msg.type === "image" || msg.type === "video") {
                return {
                  type: "text",
                  text: msg.originalContentUrl || "阿哩勒出錯了!!",
                };
              }
              return { ...msg, sender };
            })
          );
        });

      _.client.on("ready", (bot) => {
        console.log(`Discord bot ${bot.user.username} is ready.`);
      });
    });
  }
}
