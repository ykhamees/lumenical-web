import { adminFetch, adminFetchJson } from "./api";

export type MediaAsset = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  storagePath: string;
  public: boolean;
  url: string | null;
  uploadedByEmail: string | null;
  createdAt: string | null;
};

export type MediaListResponse = {
  items: MediaAsset[];
  nextCursor: string | null;
};

export async function listMedia(options: {
  cursor: string | null;
  limit: number;
}): Promise<MediaListResponse> {
  const params = new URLSearchParams({ limit: String(options.limit) });
  if (options.cursor) params.set("cursor", options.cursor);
  return adminFetchJson<MediaListResponse>(`/api/admin/media?${params}`);
}

async function getUploadUrl(
  filename: string,
  contentType: string,
  isPublic: boolean
): Promise<{ uploadUrl: string; storagePath: string }> {
  return adminFetchJson<{ uploadUrl: string; storagePath: string }>("/api/admin/media/upload-url", {
    method: "POST",
    body: JSON.stringify({ filename, contentType, public: isPublic }),
  });
}

/**
 * Gets a signed URL from the API, then PUTs the file directly to storage —
 * the bytes never pass through the API/Cloud Run, and there's never a
 * client-side write to Firestore (confirmUpload is what records it, only
 * after verifying the blob actually landed).
 */
export async function uploadFile(file: File, isPublic: boolean): Promise<MediaAsset> {
  const { uploadUrl, storagePath } = await getUploadUrl(file.name, file.type, isPublic);

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error("Upload to storage failed");
  }

  return adminFetchJson<MediaAsset>("/api/admin/media", {
    method: "POST",
    body: JSON.stringify({
      storagePath,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      public: isPublic,
    }),
  });
}

export async function deleteMedia(id: string, options?: { force?: boolean }): Promise<void> {
  const query = options?.force ? "?force=true" : "";
  await adminFetch(`/api/admin/media/${id}${query}`, { method: "DELETE" });
}
