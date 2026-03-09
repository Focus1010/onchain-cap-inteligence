import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { TokenDashboard } from "./pages/TokenDashboard";
import { ApiTest } from "./pages/ApiTest";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/token/:address",
    Component: TokenDashboard,
  },
  {
    path: "/api-test",
    Component: ApiTest,
  },
]);
