import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("settings", "routes/settings.tsx"),
  route("logged-out", "routes/logged-out.tsx"),
] satisfies RouteConfig;
