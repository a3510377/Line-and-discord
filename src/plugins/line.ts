import { FileEventMessage } from "@line/bot-sdk";

import { BasePlugin, BaseClient } from ".";

export class LineBot extends BasePlugin {
  public registerEvents(_: BaseClient) {
    _.on("message", async (event) => {
      console.log(event);
      const { source, message: msg } = event;

      if (source.type !== "group" || !source.userId) return;

      const profile = await _.line.getGroupMemberProfile(
        source.groupId,
        source.userId
      );

      const type = msg.type;

      if (type === "text") {
        // TEXT
        _.sendDiscord({
          avatarURL: profile.pictureUrl,
          username: profile.displayName,
          content: msg.text,
        });
      } else if (type === "image") {
        // IMAGE
        if (msg.contentProvider.type === "line") {
          _.sendDiscord({
            avatarURL: profile.pictureUrl,
            username: profile.displayName,
            content: "發送了一張圖片",
            files: [await _.getLINEFile("MEDIA", msg.id)],
          });
        } else {
          _.sendDiscord({
            avatarURL: profile.pictureUrl,
            username: profile.displayName,
            content: "發送了一張圖片",
            files: [msg.contentProvider.originalContentUrl],
          });
        }
      } else if (type === "sticker") {
        // STICKER
        const { packageId, stickerId, stickerResourceType } = msg;

        _.sendDiscord({
          avatarURL: profile.pictureUrl,
          username: profile.displayName,
          content: "發送了一張圖片",
          files: [
            ["ANIMATION", "ANIMATION_SOUND"].includes(stickerResourceType)
              ? _.AnimLINEStampUrl(packageId, stickerId)
              : _.LINEStampUrl(stickerId),
          ],
        });
      } else if (type === "file") {
        // FILE
        _.sendDiscord({
          avatarURL: profile.pictureUrl,
          username: profile.displayName,
          content: "發送了一張圖片",
          files: [
            await _.getLINEFile(
              (<FileEventMessage>event.message).fileName,
              msg.id,
              false
            ),
          ],
        });
      } else if (type === "audio" || type === "video") {
        // AUDIO, VIDEO
        _.sendDiscord({
          avatarURL: profile.pictureUrl,
          username: profile.displayName,
          files: [
            await _.getLINEFile(
              "MEDIA",
              msg.id,
              type === "audio" ? ".mp3" : ".mp4"
            ),
          ],
        });
      }
    });
  }
}
