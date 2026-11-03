/**
 * Minimal fetch-based HTTP client with the small slice of the axios API this app uses:
 * `http.get(url, { params })`, `http.post|put|patch(url, data, { params, headers })`,
 * `http.delete(url, { params })`. Responses resolve to `{ data, status, headers }`; non-2xx responses
 * and network failures reject with an error shaped like axios' (`error.response.{status,data}`,
 * `error.request` for network failures, `error.config.{url,method}`), so existing call sites keep working.
 */

let unauthorizedHandler = null;

/**
 * Registers a callback invoked for every 401 response (including the failing request's config), before the
 * error is re-thrown. Used to clear the local session when the server session has expired.
 * @param {(error: Error) => void} handler - Callback receiving the rejected request's error.
 */
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const buildUrl = (url, params) => {
  if (!params) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(`${key}[]`, item));
    } else {
      search.append(key, value instanceof Date ? value.toISOString() : String(value));
    }
  }
  const qs = search.toString();
  if (!qs) return url;
  return url + (url.includes("?") ? "&" : "?") + qs;
};

const parseBody = async (response) => {
  const text = await response.text();
  if (!text) return "";
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async (method, url, { data, params, headers = {} } = {}) => {
  const init = {
    method: method.toUpperCase(),
    credentials: "include",
    headers: { Accept: "application/json", ...headers },
  };

  if (data !== undefined && data !== null) {
    if (
      data instanceof FormData ||
      typeof data === "string" ||
      data instanceof Blob ||
      data instanceof URLSearchParams
    ) {
      // Let the browser set the Content-Type (multipart boundary, urlencoded charset, ...).
      if (data instanceof FormData) {
        for (const key of Object.keys(init.headers)) {
          if (key.toLowerCase() === "content-type") delete init.headers[key];
        }
      }
      init.body = data;
    } else {
      init.headers["Content-Type"] ??= "application/json";
      init.body = JSON.stringify(data);
    }
  }

  const config = { url, method: init.method.toLowerCase() };
  let response;
  try {
    response = await fetch(buildUrl(url, params), init);
  } catch (cause) {
    const error = new Error("Network Error", { cause });
    error.name = "HttpError";
    error.request = {};
    error.config = config;
    throw error;
  }

  const result = { data: await parseBody(response), status: response.status, headers: response.headers };

  if (!response.ok) {
    const error = new Error(`Request failed with status code ${response.status}`);
    error.name = "HttpError";
    error.config = config;
    error.request = {};
    error.response = result;
    if (response.status === 401) unauthorizedHandler?.(error);
    throw error;
  }

  return result;
};

const http = {
  get: (url, config) => request("get", url, config),
  delete: (url, config) => request("delete", url, config),
  post: (url, data, config) => request("post", url, { ...config, data }),
  put: (url, data, config) => request("put", url, { ...config, data }),
  patch: (url, data, config) => request("patch", url, { ...config, data }),
};

export default http;
