// useStoreSlug.js
import { useParams, useLocation } from "react-router-dom";

// Subdomains that never identify a tenant store.
const RESERVED_SUBDOMAINS = ["www", "admin", "api", "app"];

// Extracts a tenant slug from a hostname like "megagamers.orbit.app" -> "megagamers".
// Returns null for bare/root domains ("orbit.app"), localhost, IPs, and reserved subdomains.
export const resolveSlugFromHostname = (hostname) => {
  if (!hostname) return null;
  const host = hostname.split(":")[0].toLowerCase();
  if (host === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;

  const labels = host.split(".");

  // "localhost" has no TLD, so "orbit.localhost" is only 2 labels — but it IS
  // a subdomain (browsers resolve any *.localhost to 127.0.0.1 with no DNS or
  // /etc/hosts setup), so this is the standard way to exercise domain-based
  // tenancy locally, e.g. http://orbit.localhost:5173/products.
  const isLocalhostSubdomain = labels.length === 2 && labels[1] === "localhost";

  if (!isLocalhostSubdomain && labels.length <= 2) return null;

  const subdomain = labels[0];
  if (RESERVED_SUBDOMAINS.includes(subdomain)) return null;
  return subdomain;
};

// Resolves the active store's slug in priority order:
// 1. an explicit :slug route param (the /store/:slug/* paths)
// 2. a ?store= override (lets local dev exercise domain-mode without real subdomains)
// 3. the subdomain of the current hostname
export const useStoreSlug = () => {
  const { slug: paramSlug } = useParams();
  const location = useLocation();

  if (paramSlug) return paramSlug;

  const override = new URLSearchParams(location.search).get("store");
  if (override) return override.toLowerCase();

  if (typeof window === "undefined") return null;
  return resolveSlugFromHostname(window.location.hostname);
};

// Whether the current route carries the slug in its path (/store/:slug/...)
// as opposed to it being implicit from the domain or a ?store= override.
export const useIsPathScopedStore = () => {
  const { slug: paramSlug } = useParams();
  return !!paramSlug;
};

// Builds a link to another storefront page that stays consistent with how
// the current page resolved its slug: prefixed with /store/:slug in
// path-scoped mode, or a bare path (carrying the ?store= override forward,
// if one is active) in domain-scoped mode.
export const useStoreLink = () => {
  const { slug: paramSlug } = useParams();
  const location = useLocation();

  return (path = "") => {
    if (paramSlug) return `/store/${paramSlug}${path}`;

    const override = new URLSearchParams(location.search).get("store");
    return override ? `${path || "/"}?store=${override}` : path || "/";
  };
};
