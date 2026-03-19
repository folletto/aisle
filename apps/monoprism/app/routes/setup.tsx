import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppContext } from "~/context/AppContext";
import { detectProvider, getProvider, providers } from "~/providers/registry";
import UrlEntry from "~/components/UrlEntry";

export default function SetupRoute() {
  const navigate = useNavigate();
  const { setProvider } = useAppContext();
  const [error, setError] = useState<{ supportedSources: string[] } | null>(null);

  function handleSubmit(url: string) {
    const result = detectProvider(url);
    if (!result.valid) {
      setError({ supportedSources: providers.map((p) => p.displayName) });
      return;
    }
    setError(null);
    const p = getProvider(result.providerName);
    if (p) setProvider(p);
    navigate(`/login?folder=${result.resourceId}&provider=${result.providerName}`);
  }

  return <UrlEntry onSubmit={handleSubmit} error={error} />;
}
