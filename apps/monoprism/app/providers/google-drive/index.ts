import { detectGoogleDriveFolder } from "./detector";
import { loadGisScript, requestToken, requestTokenSilent, revokeToken } from "./auth";
import { getFolderMetadata, listFolderContents } from "./api";
import type {
  DetectResult,
  DriveFile,
  DriveFolder,
  FolderMetadata,
  StorageProvider,
  UserInfo,
} from "../types";

export class GoogleDriveProvider implements StorageProvider {
  readonly name = "google-drive";
  readonly displayName = "Google Drive";

  detectUrl(url: string): DetectResult {
    const folderId = detectGoogleDriveFolder(url);
    if (!folderId) return { valid: false };
    return { valid: true, resourceId: folderId, providerName: this.name };
  }

  async initAuth(): Promise<void> {
    await loadGisScript();
  }

  async authenticate(): Promise<{ token: string; user: UserInfo }> {
    return requestToken();
  }

  async silentAuthenticate(): Promise<string> {
    return requestTokenSilent();
  }

  logout(): void {
    // Token revocation is handled by AppContext which holds the token
  }

  revokeToken(token: string): void {
    revokeToken(token);
  }

  getFolderMetadata(resourceId: string, token: string | null): Promise<FolderMetadata> {
    return getFolderMetadata(resourceId, token);
  }

  listFolderContents(
    resourceId: string,
    token: string | null
  ): Promise<{ files: DriveFile[]; folders: DriveFolder[] }> {
    return listFolderContents(resourceId, token);
  }
}
