const localhostNames = new Set(["localhost", "127.0.0.1", "::1"]);

function splitHosts(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

export const adminHosts = splitHosts(import.meta.env["VITE_ADMIN_HOSTS"]);
export const publicSiteUrl = (import.meta.env["VITE_PUBLIC_SITE_URL"] ?? "/").replace(/\/$/, "");

export function isAdminHost(hostname = globalThis.location?.hostname ?? "") {
  const normalized = hostname.toLowerCase();

  if (localhostNames.has(normalized)) return true;
  if (adminHosts.length === 0) return false;

  return adminHosts.includes(normalized);
}

export function getAdminUrl(path = "/admin") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const firstAdminHost = adminHosts[0];

  if (!firstAdminHost) return normalizedPath;

  return `https://${firstAdminHost}${normalizedPath}`;
}

export function getPublicUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (publicSiteUrl === "/") return normalizedPath;

  return `${publicSiteUrl}${normalizedPath}`;
}
