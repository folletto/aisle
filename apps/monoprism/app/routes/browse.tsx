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
  // True when the folder is accessible without login (public + API key available)
  const [publicAccess, setPublicAccess] = useState(false);

  // Accumulates folder names as we navigate so re-visits skip extra API calls
  const folderNameCache = useRef<Map<string, string>>(new Map());

  // Update tab title to reflect the full folder path
  useEffect(() => {
    const parts = [metadata?.name, ...breadcrumbs.map((b) => b.name)].filter(Boolean);
    if (parts.length > 0) document.title = parts.join(" / ") + " ▞";
  }, [metadata?.name, breadcrumbs]);

  // Guard: not authenticated — probe for public access first, then try silent re-auth
  useEffect(() => {
    if (token || publicAccess) return;

    const p = getProviderBySlug(providerSlug);
    const providerName = p?.name ?? providerSlug;
    const fullPath = encodeURIComponent([rootFolderId, ...subFolderIds].filter(Boolean).join("/"));
    const loginUrl = `/login?folder=${fullPath}&provider=${providerName}`;

    if (!p) {
      navigate(loginUrl, { replace: true });
      return;
    }

    let cancelled = false;

    async function probe() {
      try {
        // Attempt to fetch folder metadata without a token (uses API key if configured)
        await p!.getFolderMetadata(rootFolderId, null);
        if (cancelled) return;
        setProvider(p!);
        setPublicAccess(true);
      } catch {
        if (cancelled) return;
        // Not publicly accessible — try silent re-auth if we have a cached user
        if (user) {
          try {
            await p!.initAuth();
            const newToken = await p!.silentAuthenticate?.();
            if (cancelled) return;
            if (newToken == null) { navigate(loginUrl, { replace: true }); return; }
            setProvider(p!);
            setAuth(newToken, user);
          } catch {
            if (!cancelled) navigate(loginUrl, { replace: true });
          }
        } else {
          navigate(loginUrl, { replace: true });
        }
      }
    }

    probe();
    return () => { cancelled = true; };
  }, [token, publicAccess, splat, providerSlug, navigate]);

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
    if (!provider || (!token && !publicAccess) || !rootFolderId) return;
    let cancelled = false;
    const effectiveToken = token ?? null;

    Promise.all([
      provider.getFolderMetadata(rootFolderId, effectiveToken),
      provider.listFolderContents(rootFolderId, effectiveToken),
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
  }, [provider, token, publicAccess, rootFolderId]);

  // Load current folder contents + breadcrumb names (runs on every URL navigation)
  useEffect(() => {
    if (!provider || (!token && !publicAccess) || !rootFolderId) return;
    let cancelled = false;
    const effectiveToken = token ?? null;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        if (subFolderIds.length > 0) {
          // Fetch names for any breadcrumb IDs not yet in the cache
          const missingIds = subFolderIds.filter((id) => !folderNameCache.current.has(id));
          await Promise.all(
            missingIds.map((id) =>
              provider!.getFolderMetadata(id, effectiveToken).then((m) => {
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

        const contents = await provider!.listFolderContents(currentFolderId, effectiveToken);
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
  }, [provider, token, publicAccess, rootFolderId, splat]);

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

  function handleLogin() {
    const providerName = provider?.name ?? providerSlug;
    navigate(`/login?folder=${rootFolderId}&provider=${providerName}`);
  }

  function handleClose() {
    navigate("/open");
  }

  const selectedSidebarId = subFolderIds.length > 0 ? subFolderIds[0] : null;

  return (
    <div className={styles.shell}>
      <Toolbar
        folderName={metadata?.name ?? ""}
        permissionsCount={metadata?.permissionsCount ?? null}
        isPublic={metadata?.isPublic ?? false}
        user={user}
        onLogout={handleLogout}
        onLogin={handleLogin}
        onClose={handleClose}
      />
      <div className={styles.body}>
        <Sidebar
          rootFolders={rootFolders}
          selectedId={selectedSidebarId}
          isHomeSelected={subFolderIds.length === 0}
          onSelect={handleSidebarSelect}
          onHomeSelect={handleHomeSelect}
        />
        <main className={styles.main}>
          {error && <p className={styles.error}>{error}</p>}
          <FileList
            folderName={metadata?.name ?? ""}
            files={files}
            subFolders={subFolderIds.length > 0 ? subFolders : []}
            breadcrumbs={subFolderIds.length > 1 ? breadcrumbs : []}
            isLoading={isLoading}
            onSubFolderClick={handleSubFolderClick}
            onBreadcrumbClick={handleBreadcrumbClick}
          />
        </main>
      </div>
    </div>
  );
}
