import { FileEventMessage } from "@line/bot-sdk";
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

      const type = msg.type;

      if (type === "text") {
        // TEXT
        this.sendDiscord({
          avatarURL: profile.pictureUrl,
          username: profile.displayName,
          content: msg.text,
        });
      } else if (type === "image") {
        // IMAGE
        if (msg.contentProvider.type === "line") {
          this.sendDiscord({
            avatarURL: profile.pictureUrl,
            username: profile.displayName,
            content: "發送了一張圖片",
            files: [await this.getLINEFile("MEDIA", msg.id)],
          });
        } else {
          this.sendDiscord({
            avatarURL: profile.pictureUrl,
            username: profile.displayName,
            content: "發送了一張圖片",
            files: [msg.contentProvider.originalContentUrl],
          });
        }
      } else if (type === "sticker") {
        // STICKER
        const { packageId, stickerId, stickerResourceType } = msg;

        this.sendDiscord({
          avatarURL: profile.pictureUrl,
          username: profile.displayName,
          content: "發送了一張圖片",
          files: [
            ["ANIMATION", "ANIMATION_SOUND"].includes(stickerResourceType)
              ? this.AnimLINEStampUrl(packageId, stickerId)
              : this.LINEStampUrl(stickerId),
          ],
        });
      } else if (type === "file") {
        // FILE
        this.sendDiscord({
          avatarURL: profile.pictureUrl,
          username: profile.displayName,
          content: "發送了一張圖片",
          files: [
            await this.getLINEFile(
              (<FileEventMessage>event.message).fileName,
              msg.id,
              false
            ),
          ],
        });
      } else if (type === "audio" || type === "video") {
        // AUDIO, VIDEO
        this.sendDiscord({
          avatarURL: profile.pictureUrl,
          username: profile.displayName,
          files: [await this.getLINEFile("MEDIA", msg.id, false)],
        });
      }
    });

    this.client.on("messageCreate", async (event) => {
      const { channel, reference, author } = event;

      if (event.channelId !== process.env.DISCORD_CHANNEL_ID || author.bot)
        return;

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
