export enum MIME {
  PNG = "image/png",
  JPEG = "image/jpeg",
  GIF = "image/gif",
  HEIC = "image/heic",
  APNG = "image/apng",
  UNKNOWN = "application/octet-stream",
}

export const MAGIG_NUMBER: Record<string, number[]> = {
  [MIME.PNG]: [0x89, 0x50, 0x4e, 0x47],
  [MIME.JPEG]: [0xff, 0xd8],
  [MIME.GIF]: [0x47, 0x49, 0x46, 0x38],
  [MIME.HEIC]: [
    0x00, 0x00, 0x00, 0x28, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63,
  ],
};

export const EXT: Record<MIME, string> = {
  [MIME.PNG]: "png",
  [MIME.JPEG]: "jpeg",
  [MIME.GIF]: "gif",
  [MIME.HEIC]: "heic",
  [MIME.APNG]: "apng",
  [MIME.UNKNOWN]: "",
};

export const getMimeType = (raw: Uint8Array): MIME => {
  for (const magicName of Object.keys(MAGIG_NUMBER)) {
    const magic = MAGIG_NUMBER[magicName];

    for (let i = 0; i < magic.length; i++) {
      if (magic[i] !== raw[i]) break;
    }

    return <MIME>magicName;
  }

  return MIME.UNKNOWN;
};

export const getFileExt = (raw: Uint8Array): string => EXT[getMimeType(raw)];
