/**
 * PathForge AI — Safe Browser API Client
 * Safely handles HTTP status, content-types, empty bodies, and non-JSON responses
 * without throwing raw "Unexpected end of JSON input" exceptions.
 */

export interface SafeFetchResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}

export function getApiBaseUrl(): string {
  const env = (import.meta as any)?.env;
  if (env && env.VITE_API_URL) {
    return String(env.VITE_API_URL).replace(/\/+$/, '');
  }
  // When deployed in production (e.g. on Vercel) and VITE_API_URL is unset,
  // automatically target the live verified Render backend API
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://pathforgeai-fgjf.onrender.com';
  }
  return '';
}

export function resolveApiUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input === 'string') {
    const baseUrl = getApiBaseUrl();
    if (baseUrl && input.startsWith('/api')) {
      return `${baseUrl}${input}`;
    }
  } else if (typeof URL !== 'undefined' && input instanceof URL) {
    const baseUrl = getApiBaseUrl();
    if (baseUrl && input.pathname.startsWith('/api')) {
      return new URL(`${baseUrl}${input.pathname}${input.search}`);
    }
  }
  return input;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<SafeFetchResult<T>> {
  try {
    const targetUrl = resolveApiUrl(input);
    const response = await fetch(targetUrl, init);
    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();

    // 1. Detect empty response bodies before parsing
    if (!rawText || rawText.trim() === '') {
      if (response.ok) {
        return {
          ok: true,
          status: response.status,
          data: null,
          error: null,
        };
      }
      return {
        ok: false,
        status: response.status,
        data: null,
        error: `Server responded with HTTP ${response.status} but returned an empty response body. Please verify that the backend API is running and accessible.`,
      };
    }

    // 2. Parse JSON with safe exception handling
    let parsedData: any = null;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Body is not valid JSON (e.g. HTML error page or raw plain text)
      const sanitizedPreview = rawText
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 140);

      const typeSuffix = contentType ? ` [type: ${contentType.split(';')[0]}]` : '';
      return {
        ok: false,
        status: response.status,
        data: null,
        error: `Server returned a non-JSON response (HTTP ${response.status}): "${sanitizedPreview || 'No readable text'}"${typeSuffix}.`,
      };
    }

    // 3. Handle JSON response
    if (!response.ok) {
      const serverErrorMessage =
        parsedData?.error ||
        parsedData?.message ||
        `Request failed with HTTP status ${response.status}.`;
      return {
        ok: false,
        status: response.status,
        data: parsedData,
        error: serverErrorMessage,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: parsedData as T,
      error: null,
    };
  } catch (netErr: any) {
    // 4. Handle network-level errors (offline, proxy connection refused, DNS failure)
    return {
      ok: false,
      status: 0,
      data: null,
      error:
        netErr?.message === 'Failed to fetch' || netErr?.name === 'TypeError'
          ? 'Unable to connect to PathForge AI backend server. Please verify your connection or use the offline fallback mode.'
          : (netErr?.message || 'Network connection failed.'),
    };
  }
}
