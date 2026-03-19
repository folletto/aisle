import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppContext } from "~/context/AppContext";
import { getProvider } from "~/providers/registry";
import LoginPrompt from "~/components/LoginPrompt";

export default function LoginRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, setAuth, setProvider } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const folder = searchParams.get("folder") ?? "";
  const providerName = searchParams.get("provider") ?? "google-drive";
  const provider = getProvider(providerName);

  // Guard: already authenticated, or missing folder param
  useEffect(() => {
    if (!folder) {
      navigate("/setup", { replace: true });
      return;
    }
    if (token) {
      navigate(`/browse?folder=${folder}`, { replace: true });
    }
  }, [token, folder, navigate]);

  useEffect(() => {
    if (provider) {
      provider.initAuth().catch(console.error);
    }
  }, [provider]);

  async function handleLogin() {
    if (!provider) {
      setError("Unknown provider. Please go back and try again.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { token: newToken, user } = await provider.authenticate();
      setProvider(provider);
      setAuth(newToken, user);
      navigate(`/browse?folder=${folder}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <LoginPrompt
      providerName={provider?.displayName ?? providerName}
      folderId={folder}
      onLogin={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
}
