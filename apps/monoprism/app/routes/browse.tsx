import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppContext } from "~/context/AppContext";
import Toolbar from "~/components/Toolbar";
import Sidebar from "~/components/Sidebar";
import FileList from "~/components/FileList";
import type { DriveFile, DriveFolder, FolderMetadata } from "~/providers/types";
import styles from "./browse.module.css";

interface BreadcrumbItem {
  id: string;
  name: string;
}

export default function BrowseRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { provider, token, user, logout } = useAppContext();

  const rootFolderId = searchParams.get("folder") ?? "";

  const [metadata, setMetadata] = useState<FolderMetadata | null>(null);
  const [rootFolders, setRootFolders] = useState<DriveFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState(rootFolderId);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [subFolders, setSubFolders] = useState<DriveFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard: not authenticated
  useEffect(() => {
    if (!token) {
      const params = new URLSearchParams({ folder: rootFolderId, provider: provider?.name ?? "google-drive" });
      navigate(`/login?${params.toString()}`, { replace: true });
    }
  }, [token, rootFolderId, provider, navigate]);

  // Initial load: root folder metadata + contents
  useEffect(() => {
    if (!provider || !token || !rootFolderId) return;
    let cancelled = false;

    async function loadRoot() {
      setIsLoading(true);
      setError(null);
      try {
        const [meta, contents] = await Promise.all([
          provider!.getFolderMetadata(rootFolderId, token!),
          provider!.listFolderContents(rootFolderId, token!),
        ]);
        if (cancelled) return;
        setMetadata(meta);
        setRootFolders(contents.folders);
        setFiles(contents.files);
        setSubFolders([]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load folder");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadRoot();
    return () => { cancelled = true; };
  }, [provider, token, rootFolderId]);

  // Load contents when currentFolderId changes (sidebar tab or breadcrumb nav)
  useEffect(() => {
    if (!provider || !token || currentFolderId === rootFolderId) return;
    let cancelled = false;

    async function loadFolder() {
      setIsLoading(true);
      setError(null);
      try {
        const contents = await provider!.listFolderContents(currentFolderId, token!);
        if (cancelled) return;
        setFiles(contents.files);
        setSubFolders(contents.folders);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load folder");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadFolder();
    return () => { cancelled = true; };
  }, [provider, token, currentFolderId, rootFolderId]);

  function handleSidebarSelect(folder: DriveFolder) {
    setCurrentFolderId(folder.id);
    setBreadcrumbs([{ id: folder.id, name: folder.name }]);
  }

  function handleHomeSelect() {
    setCurrentFolderId(rootFolderId);
    setBreadcrumbs([]);
  }

  function handleSubFolderClick(folder: DriveFolder) {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  }

  function handleBreadcrumbClick(index: number) {
    const crumb = breadcrumbs[index];
    setCurrentFolderId(crumb.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  }

  function handleLogout() {
    logout();
    navigate(`/logged-out?folder=${rootFolderId}&provider=${provider?.name ?? "google-drive"}`);
  }

  const selectedSidebarId = breadcrumbs.length > 0
    ? breadcrumbs[0].id
    : currentFolderId === rootFolderId ? null : currentFolderId;

  const currentFolderName = breadcrumbs.length > 0
    ? breadcrumbs[breadcrumbs.length - 1].name
    : currentFolderId === rootFolderId
    ? (metadata?.name ?? "")
    : "";

  return (
    <div className={styles.shell}>
      <Toolbar
        folderName={metadata?.name ?? ""}
        permissionsCount={metadata?.permissionsCount ?? null}
        isPublic={metadata?.isPublic ?? false}
        user={user}
        onLogout={handleLogout}
      />
      <div className={styles.body}>
        <Sidebar
          rootFolders={rootFolders}
          selectedId={selectedSidebarId}
          onSelect={handleSidebarSelect}
          onHomeSelect={handleHomeSelect}
          isHomeSelected={currentFolderId === rootFolderId}
        />
        <main className={styles.main}>
          {error && <p className={styles.error}>{error}</p>}
          <FileList
            folderName={currentFolderName}
            files={files}
            subFolders={currentFolderId !== rootFolderId ? subFolders : []}
            breadcrumbs={breadcrumbs}
            isLoading={isLoading}
            onSubFolderClick={handleSubFolderClick}
            onBreadcrumbClick={handleBreadcrumbClick}
          />
        </main>
      </div>
    </div>
  );
}
