import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useEffect } from "react";
import { AuthProvider } from "~/context/AuthContext";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Particle - Your Bluesky timeline, distilled"
        />
        <title>Particle</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useEffect(() => {
    import("~/debug/consoleApi").then(({ initConsoleApi }) => initConsoleApi());
  }, []);

  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
