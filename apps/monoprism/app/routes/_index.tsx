import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppContext } from "~/context/AppContext";

/**
 * Entry point. Reads ?folder and ?provider search params, checks auth state,
 * and redirects to the appropriate route.
 */
export default function IndexRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAppContext();

  useEffect(() => {
    const folder = searchParams.get("folder");
    const provider = searchParams.get("provider");

    if (!folder) {
      navigate("/setup", { replace: true });
      return;
    }

    if (!token) {
      const params = new URLSearchParams({ folder });
      if (provider) params.set("provider", provider);
      navigate(`/login?${params.toString()}`, { replace: true });
      return;
    }

    navigate(`/browse?folder=${folder}`, { replace: true });
  }, [navigate, searchParams, token]);

  return null;
}
