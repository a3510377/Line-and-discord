export enum MIME {
  PNG = "image/png",
  JPEG = "image/jpeg",
  GIF = "image/gif",
  HEIC = "image/heic",
  APNG = "image/apng",
  FLAC = "audio/flac",
  MP3 = "audio/mp3",
  OGG = "audio/ogg",
  WAV = "audio/wav",
  UNKNOWN = "application/octet-stream",
}

export const MAGIG_NUMBER: Record<
  string,
  (number | string)[] | Array<(number | string)[]>
> = {
  [MIME.PNG]: [0x89, 0x50, 0x4e, 0x47],
  [MIME.JPEG]: [0xff, 0xd8],
  [MIME.GIF]: [0x47, 0x49, 0x46, 0x38],
  [MIME.HEIC]: [
    0x00, 0x00, 0x00, 0x28, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63,
  ],
  [MIME.FLAC]: [0x66, 0x4c, 0x61, 0x43],
  [MIME.MP3]: [
    [0x49, 0x44, 0x33],
    [0xff, 0xfb],
  ],
  [MIME.OGG]: [0x4f, 0x67, 0x67, 0x53],
  [MIME.WAV]: [0x52, 0x49, 0x46, 0x46, "", "", "", "", 0x57, 0x41, 0x56, 0x45],
};

export const EXT: Record<MIME, string> = {
  [MIME.PNG]: "png",
  [MIME.JPEG]: "jpeg",
  [MIME.GIF]: "gif",
  [MIME.HEIC]: "heic",
  [MIME.APNG]: "apng",
  [MIME.FLAC]: "flac",
  [MIME.MP3]: "mp3",
  [MIME.OGG]: "ogg",
  [MIME.WAV]: "wav",
  [MIME.UNKNOWN]: "",
};

export const getMimeType = (raw: Uint8Array): MIME => {
  for (const magicName of Object.keys(MAGIG_NUMBER)) {
    const magic = MAGIG_NUMBER[magicName];

    let eq = true;

    for (let i = 0; i < magic.length; i++) {
      if (Array.isArray(magic[0])) {
        const magic_ = <number[]>magic[i];
        for (let i_ = 0; i_ < magic_.length; i_++) {
          if (typeof magic_[i_] === "string") continue;
          if (magic_[i_] !== raw[i_]) {
            eq = false;
            break;
          }
        }
      } else if (typeof magic[i] === "string") continue;
      else if (magic[i] !== raw[i]) {
        eq = false;
        break;
      }
    }

    if (eq) return <MIME>magicName;
  }

  return MIME.UNKNOWN;
};

export const getFileExt = (raw: Uint8Array): string => EXT[getMimeType(raw)];
