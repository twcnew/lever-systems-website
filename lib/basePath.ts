/** GitHub Pages serves at /lumio/ — empty string in local dev. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix public assets and internal paths for static export. */
export function withBasePath(path: string | undefined): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("#")) return path;
  if (basePath && path.startsWith(basePath)) return path;
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
