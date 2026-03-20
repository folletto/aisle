import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppContext } from "~/context/AppContext";
import { getProviderBySlug } from "~/providers/registry";
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
  // Route is "browse/*" — the splat captures everything after /browse/
  // URL format: /browse/{providerSlug}/{rootFolderId}/{subId1}/{subId2}/...
  const { "*": splat = "" } = useParams();
  const segments = splat.split("/").filter(Boolean);
  const [providerSlug = "", rootFolderId = "", ...subFolderIds] = segments;
  const currentFolderId = subFolderIds.length > 0 ? subFolderIds[subFolderIds.length - 1] : rootFolderId;

  const { provider, token, user, setAuth, setProvider, clearToken, logout } = useAppContext();

  const [metadata, setMetadata] = useState<FolderMetadata | null>(null);
  const [rootFolders, setRootFolders] = useState<DriveFolder[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [subFolders, setSubFolders] = useState<DriveFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Accumulates folder names as we navigate so re-visits skip extra API calls
  const folderNameCache = useRef<Map<string, string>>(new Map());

  // Update tab title to reflect the full folder path
  useEffect(() => {
    const parts = [metadata?.name, ...breadcrumbs.map((b) => b.name)].filter(Boolean);
    if (parts.length > 0) document.title = parts.join(" / ") + " ▞";
  }, [metadata?.name, breadcrumbs]);

  // Guard: not authenticated — try silent re-auth in-place to avoid a login flash
  useEffect(() => {
    if (token) return;

    const providerName = getProviderBySlug(providerSlug)?.name ?? providerSlug;
    const fullPath = encodeURIComponent([rootFolderId, ...subFolderIds].filter(Boolean).join("/"));
    const loginUrl = `/login?folder=${fullPath}&provider=${providerName}`;

    const p = getProviderBySlug(providerSlug);
    if (!p || !user) {
      navigate(loginUrl, { replace: true });
      return;
    }

    // Cached user + known provider → attempt silent re-auth without leaving the page
    let cancelled = false;
    p.initAuth()
      .then(() => p.silentAuthenticate?.())
      .then((newToken) => {
        if (cancelled) return;
        if (newToken == null) { navigate(loginUrl, { replace: true }); return; }
        setProvider(p);
        setAuth(newToken, user);
      })
      .catch(() => { if (!cancelled) navigate(loginUrl, { replace: true }); });
    return () => { cancelled = true; };
  }, [token, splat, providerSlug, navigate]);

  // Restore provider from URL slug when token is valid but provider context is empty.
  // This handles the case where localStorage has a valid token but the stored provider
  // name is stale/missing (edge case: stored under a different key version, etc.).
  useEffect(() => {
    if (provider || !token) return;
    const p = getProviderBySlug(providerSlug);
    if (p) setProvider(p);
  }, [provider, token, providerSlug]);

  // Load root folder metadata + sidebar folders (runs once per rootFolderId)
  useEffect(() => {
    if (!provider || !token || !rootFolderId) return;
    let cancelled = false;

    Promise.all([
      provider.getFolderMetadata(rootFolderId, token),
      provider.listFolderContents(rootFolderId, token),
    ])
      .then(([meta, contents]) => {
        if (cancelled) return;
        setMetadata(meta);
        setRootFolders(contents.folders);
      })
      .catch((err) => {
        if (cancelled) return;
        if ((err as Error & { status?: number }).status === 401) {
          clearToken(); // guard will re-run silent auth; keep loading spinner
        } else {
          setError(err instanceof Error ? err.message : "Failed to load folder");
        }
      });

    return () => { cancelled = true; };
  }, [provider, token, rootFolderId]);

  // Load current folder contents + breadcrumb names (runs on every URL navigation)
  useEffect(() => {
    if (!provider || !token || !rootFolderId) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        if (subFolderIds.length > 0) {
          // Fetch names for any breadcrumb IDs not yet in the cache
          const missingIds = subFolderIds.filter((id) => !folderNameCache.current.has(id));
          await Promise.all(
            missingIds.map((id) =>
              provider!.getFolderMetadata(id, token!).then((m) => {
                folderNameCache.current.set(id, m.name);
              })
            )
          );
          if (cancelled) return;
          setBreadcrumbs(
            subFolderIds.map((id) => ({ id, name: folderNameCache.current.get(id) ?? id }))
          );
        } else {
          setBreadcrumbs([]);
        }

        const contents = await provider!.listFolderContents(currentFolderId, token!);
        if (cancelled) return;
        setFiles(contents.files);
        setSubFolders(contents.folders);
      } catch (err) {
        if (cancelled) return;
        if ((err as Error & { status?: number }).status === 401) {
          clearToken(); // guard will re-run silent auth; keep loading spinner
        } else {
          setError(err instanceof Error ? err.message : "Failed to load folder");
          setIsLoading(false);
        }
        return;
      }
      if (!cancelled) setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, token, rootFolderId, splat]);

  function navigateTo(ids: string[]) {
    const base = `/browse/${providerSlug}/${rootFolderId}`;
    navigate(ids.length > 0 ? `${base}/${ids.join("/")}` : base);
  }

  function handleSidebarSelect(folder: DriveFolder) {
    folderNameCache.current.set(folder.id, folder.name);
    navigateTo([folder.id]);
  }

  function handleHomeSelect() {
    navigateTo([]);
  }

  function handleSubFolderClick(folder: DriveFolder) {
    folderNameCache.current.set(folder.id, folder.name);
    navigateTo([...subFolderIds, folder.id]);
  }

  function handleBreadcrumbClick(index: number) {
    navigateTo(subFolderIds.slice(0, index + 1));
  }

  function handleLogout() {
    logout();
    navigate(`/logged-out?folder=${rootFolderId}&provider=${provider?.name ?? providerSlug}`);
  }

  const selectedSidebarId = subFolderIds.length > 0 ? subFolderIds[0] : null;

  const currentFolderName =
    breadcrumbs.length > 0
      ? breadcrumbs[breadcrumbs.length - 1].name
      : metadata?.name ?? "";

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
          isHomeSelected={subFolderIds.length === 0}
        />
        <main className={styles.main}>
          {error && <p className={styles.error}>{error}</p>}
          <FileList
            folderName={currentFolderName}
            files={files}
            subFolders={subFolderIds.length > 0 ? subFolders : []}
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
