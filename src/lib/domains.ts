function splitHosts(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

export const adminHosts = splitHosts(import.meta.env["VITE_ADMIN_HOSTS"]);
export const publicSiteUrl = (import.meta.env["VITE_PUBLIC_SITE_URL"] ?? "/").replace(/\/$/, "");

export function getAdminUrl(path = "/amin") {
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
