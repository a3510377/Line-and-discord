import axios from "axios";
import { MessagePayload, WebhookMessageOptions } from "discord.js";
import { BaseClient } from "./baseClient";

export class Client extends BaseClient {
  constructor() {
    super();
    this.registerEvents();
  }

  protected registerEvents() {
    this.on("join", async ({ source }) => {
      if (source.type === "group") this.line.leaveGroup(source.groupId);
      else if (source.type === "room") this.line.leaveRoom(source.roomId);
    });
    this.on("message", async (event) => {
      console.log(event);

      if (event.source.type !== "group") return;

      const source = event.source;
      const author = await this.line.getGroupMemberProfile(
        source.groupId,
        <string>source.userId
      );
      const postData: string | MessagePayload | WebhookMessageOptions = {
        username: author.displayName,
        avatarURL: author.pictureUrl,
      };

      if (event.message.type === "text") postData.content = event.message.text;
      else if (event.message.type === "sticker") {
        postData.content = `發送了一個 ${
          event.message.keywords?.[0] || "不知名"
        } 貼圖`;
      } else if (event.message.type === "file") {
        postData.files = [
          await this.getLineMessageFile(
            event.message.id,
            event.message.fileName
          ),
        ];
      } else if (event.message.type == "image") {
        postData.files = [
          await this.getLineMessageFile(event.message.id, "media.jpg"),
        ];
      } else if (event.message.type == "video") {
        postData.files = [
          await this.getLineMessageFile(event.message.id, "media.mp4"),
        ];
      } else if (event.message.type == "audio") {
        postData.files = [
          await this.getLineMessageFile(event.message.id, "media.mp3"),
        ];
      }

      this.webhook.send(postData).catch();
    });

    this.client.on("messageCreate", async (event) => {
      const { channel, reference, attachments, member, author } = event;

      if (event.channelId !== process.env.DISCORD_CHANNEL_ID || author.bot)
        return;

      let content = event.content;

      if (reference?.messageId) {
        const referenceMsg = await channel.messages.fetch(reference.messageId);
        if (referenceMsg) {
          content = `${referenceMsg.content || "..."} > ${content}`;
        }
      }
      if (event.content) {
        const bodyData = new FormData();

        bodyData.append(
          "message",
          `<${member?.nickname || author.username}>:\n${content}`
        );

        axios
          .post("https://notify-api.line.me/api/notify", bodyData, {
            headers: { Authorization: `Bearer ${process.env.NOTIFY_TOKEN}` },
          })
          .catch();
      }

      await Promise.all(
        attachments.map(async (data) => {
          const bodyData = new FormData();
          if (data.contentType?.split("/")[0] === "image") {
            bodyData.append(
              "message",
              `<${member?.nickname || author.username}>:`
            );
            bodyData.append("imageFullsize", data.url);
            bodyData.append("imageThumbnail", data.url);
          } else event.content += `\n${data.url}`;
          // deliveryContext: { isRedelivery: false },
          axios
            .post("https://notify-api.line.me/api/notify", bodyData, {
              headers: { Authorization: `Bearer ${process.env.NOTIFY_TOKEN}` },
            })
            .catch();
        })
      );
    });
  }
}
