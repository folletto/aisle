import type { DriveFile, DriveFolder, FolderMetadata } from "../types";
import { GOOGLE_API_KEY } from "~/config";

const BASE = "https://www.googleapis.com/drive/v3";

async function driveGet<T>(path: string, token: string | null, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (GOOGLE_API_KEY) {
    url.searchParams.set("key", GOOGLE_API_KEY);
  }
  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const err = new Error(`Drive API error ${res.status}: ${res.statusText}`);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

interface DrivePermission {
  id: string;
  type: string;
  role: string;
}

interface PermissionsListResponse {
  permissions: DrivePermission[];
}

interface FileResource {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink: string;
}

interface FilesListResponse {
  files: FileResource[];
  nextPageToken?: string;
}

export async function getFolderMetadata(folderId: string, token: string | null): Promise<FolderMetadata> {
  const file = await driveGet<FileResource & { permissionIds?: string[] }>(
    `/files/${folderId}`,
    token,
    { fields: "id,name,permissionIds" }
  );

  let permissionsCount: number | null = null;
  let isPublic = false;

  try {
    const perms = await driveGet<PermissionsListResponse>(
      `/files/${folderId}/permissions`,
      token,
      { fields: "permissions(id,type,role)" }
    );
    permissionsCount = perms.permissions.length;
    isPublic = perms.permissions.some(
      (p) => p.type === "anyone" || p.id === "anyoneWithLink"
    );
  } catch (err) {
    // 403 means the caller can't list permissions (viewer role) — that's fine
    if ((err as Error & { status?: number }).status !== 403) throw err;
  }

  return {
    id: file.id,
    name: file.name,
    permissionsCount,
    isPublic,
  };
}

const FOLDER_MIME = "application/vnd.google-apps.folder";

export async function listFolderContents(
  folderId: string,
  token: string | null
): Promise<{ files: DriveFile[]; folders: DriveFolder[] }> {
  const allItems: FileResource[] = [];
  let pageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType,modifiedTime,size,webViewLink)",
      pageSize: "1000",
      orderBy: "folder,name",
    };
    if (pageToken) params.pageToken = pageToken;

    const page = await driveGet<FilesListResponse>("/files", token, params);
    allItems.push(...page.files);
    pageToken = page.nextPageToken;
  } while (pageToken);

  const files: DriveFile[] = [];
  const folders: DriveFolder[] = [];

  for (const item of allItems) {
    if (item.mimeType === FOLDER_MIME) {
      folders.push({ id: item.id, name: item.name, webViewLink: item.webViewLink });
    } else {
      files.push({
        id: item.id,
        name: item.name,
        mimeType: item.mimeType,
        modifiedTime: item.modifiedTime,
        size: item.size,
        webViewLink: item.webViewLink,
      });
    }
  }

  return { files, folders };
}
