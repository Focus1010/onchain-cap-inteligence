import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { TokenDashboard } from "./pages/TokenDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/token/:address",
    Component: TokenDashboard,
  },
]);
