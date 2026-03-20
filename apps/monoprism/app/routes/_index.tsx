import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppContext } from "~/context/AppContext";
import { getProviderSlug } from "~/providers/registry";

/**
 * Entry point. Reads ?folder and ?provider search params, checks auth state,
 * and redirects to the appropriate route.
 *
 * Supports legacy ?folder=X&provider=Y links by redirecting to the canonical
 * path-based URL: /browse/:providerSlug/:rootFolderId
 */
export default function IndexRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAppContext();

  useEffect(() => {
    const folder = searchParams.get("folder");
    const provider = searchParams.get("provider") ?? "google-drive";

    if (!folder) {
      navigate("/setup", { replace: true });
      return;
    }

    if (!token) {
      const params = new URLSearchParams({ folder, provider });
      navigate(`/login?${params.toString()}`, { replace: true });
      return;
    }

    const slug = getProviderSlug(provider);
    navigate(`/browse/${slug}/${folder}`, { replace: true });
  }, [navigate, searchParams, token]);

  return null;
}
