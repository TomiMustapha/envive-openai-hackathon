import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/chat", "routes/api.chat.ts"),
  route("api/email-agent", "routes/api.email-agent.ts"),
] satisfies RouteConfig;
