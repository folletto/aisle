import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("setup", "routes/setup.tsx"),
  route("login", "routes/login.tsx"),
  route("browse", "routes/browse.tsx"),
  route("logged-out", "routes/logged-out.tsx"),
] satisfies RouteConfig;
