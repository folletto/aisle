export interface UserInfo {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  webViewLink: string;
}

export interface FolderMetadata {
  id: string;
  name: string;
  /** null when the caller lacks permission to list permissions (e.g. viewer role) */
  permissionsCount: number | null;
  isPublic: boolean;
}

export type DetectResult =
  | { valid: true; resourceId: string; providerName: string }
  | { valid: false };

export interface StorageProvider {
  readonly name: string;
  readonly displayName: string;

  detectUrl(url: string): DetectResult;
  /** Load any external SDK/script required before auth (idempotent). */
  initAuth(): Promise<void>;
  /** Trigger the provider's login popup/flow. Returns authenticated user info. */
  authenticate(): Promise<{ token: string; user: UserInfo }>;
  /** Attempt a silent token refresh with no user interaction. Rejects if interaction is required. */
  silentAuthenticate?(): Promise<string>;
  logout(): void;
  getFolderMetadata(resourceId: string, token: string): Promise<FolderMetadata>;
  listFolderContents(
    resourceId: string,
    token: string
  ): Promise<{ files: DriveFile[]; folders: DriveFolder[] }>;
}
