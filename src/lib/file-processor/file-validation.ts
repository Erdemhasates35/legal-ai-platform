const MAX_FILE_SIZE = 50 * 1024 * 1024;

const EXTENSION_MIME_MAP: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  udf: ["application/octet-stream", "application/udf", "text/plain"]
};

export interface ValidatedUpload {
  extension: string;
  safeName: string;
  storageName: string;
}

export function validateUpload(file: File): ValidatedUpload {
  if (!file.name || file.size <= 0) throw new Error("EMPTY_FILE");
  if (file.size > MAX_FILE_SIZE) throw new Error("FILE_TOO_LARGE");

  const rawExtension = file.name.toLowerCase().split(".").pop() ?? "";
  if (!Object.prototype.hasOwnProperty.call(EXTENSION_MIME_MAP, rawExtension)) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }

  const allowedMimeTypes = EXTENSION_MIME_MAP[rawExtension];
  if (file.type && !allowedMimeTypes.includes(file.type)) {
    throw new Error("MIME_EXTENSION_MISMATCH");
  }

  const baseName = file.name
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .slice(0, 160);

  const safeName = baseName || `document.${rawExtension}`;
  const storageName = `${crypto.randomUUID()}-${safeName}`;

  return { extension: rawExtension, safeName, storageName };
}
