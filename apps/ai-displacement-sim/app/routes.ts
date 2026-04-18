import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("simulation", "routes/simulation.tsx"),
  route("methodology", "routes/methodology.tsx"),
  route("sources", "routes/sources.tsx"),
] satisfies RouteConfig;
