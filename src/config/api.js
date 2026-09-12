const configuredApiUrl =
  import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL =
  configuredApiUrl ||
  `${window.location.protocol}//${window.location.hostname}:3001`;

export const FAMILYHUB_API_KEY =
  import.meta.env.VITE_FAMILYHUB_API_KEY?.trim() || "";

const nativeFetch = window.fetch.bind(window);

function isFamilyHubApiRequest(input) {
  try {
    const requestUrl =
      typeof input === "string"
        ? input
        : input instanceof Request
          ? input.url
          : String(input);

    const resolvedUrl = new URL(requestUrl, window.location.href);
    const apiUrl = new URL(API_BASE_URL, window.location.href);

    return (
      resolvedUrl.origin === apiUrl.origin &&
      resolvedUrl.pathname.startsWith("/api/")
    );
  } catch {
    return false;
  }
}

export function installFamilyHubFetchAuth() {
  window.fetch = async (input, options = {}) => {
    if (!FAMILYHUB_API_KEY || !isFamilyHubApiRequest(input)) {
      return nativeFetch(input, options);
    }

    if (input instanceof Request) {
      const headers = new Headers(input.headers);

      headers.set("X-FamilyHub-Key", FAMILYHUB_API_KEY);

      const authenticatedRequest = new Request(input, {
        headers,
      });

      return nativeFetch(authenticatedRequest, options);
    }

    const headers = new Headers(options.headers || {});

    headers.set("X-FamilyHub-Key", FAMILYHUB_API_KEY);

    return nativeFetch(input, {
      ...options,
      headers,
    });
  };
}

export async function apiFetch(path, options = {}) {
  return fetch(`${API_BASE_URL}${path}`, options);
}