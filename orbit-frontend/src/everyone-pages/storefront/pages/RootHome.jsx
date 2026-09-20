// RootHome.jsx
// Renders the tenant's storefront when the current domain (or a ?store=
// override) resolves to a business; otherwise falls back to the platform's
// own marketing homepage.
import Home from "../../home/pages/Home";
import StorefrontHome from "./StorefrontHome";
import { useStoreSlug } from "../hooks/useStoreSlug";

const RootHome = () => {
  const slug = useStoreSlug();
  return slug ? <StorefrontHome /> : <Home />;
};

export default RootHome;
