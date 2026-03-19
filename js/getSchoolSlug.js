export function getSchoolSlug() {
  const hostname = window.location.hostname.toLowerCase();

  // Local testing
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app") ||
    hostname.startsWith("www.")
  ) {
    return "standrews-savannahga";
  }

  const parts = hostname.split(".");

  // Example:
  // standrews-savannahga.preplegacy.com
  // -> ["standrews-savannahga", "preplegacy", "com"]
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}
