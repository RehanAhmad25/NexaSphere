const DEFAULT_PUBLIC_APP_URL = "http://localhost:5173";

function normalizeAbsoluteHttpUrl(value, envName) {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("URL must use http or https");
    }

    return url.href.replace(/\/+$/, "");
  } catch {
    throw new Error(`${envName} must contain a valid absolute HTTP(S) URL`);
  }
}

export function getPublicAppUrl(env = process.env) {
  const publicAppUrl = env.PUBLIC_APP_URL?.trim();

  if (publicAppUrl) {
    if (publicAppUrl.includes(",")) {
      throw new Error(
        "PUBLIC_APP_URL must be a single URL, not a comma-separated list",
      );
    }

    return normalizeAbsoluteHttpUrl(publicAppUrl, "PUBLIC_APP_URL");
  }

  const firstCorsOrigin = env.CORS_ORIGIN?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)[0];

  if (firstCorsOrigin) {
    return normalizeAbsoluteHttpUrl(firstCorsOrigin, "CORS_ORIGIN");
  }

  return DEFAULT_PUBLIC_APP_URL;
}
