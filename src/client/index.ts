import axios from "axios";
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
      const { source, message: msg } = event;

      if (source.type !== "group" || !source.userId) return;

      const profile = await this.line.getGroupMemberProfile(
        source.groupId,
        source.userId
      );

      switch (msg.type) {
        case "text":
          this.sendDiscord({
            avatarURL: profile.pictureUrl,
            username: profile.displayName,
            content: msg.text || "",
          });

          break;

        case "image":
          switch (msg.contentProvider.type) {
            case "line": {
              const { contentProvider } = msg;
              contentProvider;

              break;
            }
            case "external": {
              this.sendDiscord({
                avatarURL: profile.pictureUrl,
                username: profile.displayName,
                content: "發送了一張圖片",
                files: [msg.contentProvider.originalContentUrl],
              });

              break;
            }
          }
      }
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
