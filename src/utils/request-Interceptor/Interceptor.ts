import Cookies from "js-cookie";

interface Options {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
}

export const BackendRequest = async (url: string, options: Options = {}) => {
  try {
    if (options.queryParams) {
      const params = new URLSearchParams(options.queryParams).toString();
      url = `${url}?${params}`;
    }

    options.headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };

    const resp = await fetch(url, options);

    // Global 401 Session-out interceptor
    if (resp.status === 401) {
      if (typeof window !== "undefined") {
        Cookies.remove("authToken", { path: "/" });
        Cookies.remove("isLoggedIn", { path: "/" });
        Cookies.remove("userId", { path: "/" });
        Cookies.remove("storeId", { path: "/" });
        Cookies.remove("userRoles", { path: "/" });
        Cookies.remove("name", { path: "/" });

        window.dispatchEvent(new CustomEvent("surge_session_expired"));
      }
    }

    let response: any = null;
    try {
      response = await resp.json();
    } catch (e) {
      response = { error: true, message: resp.statusText };
    }

    return { response, status: resp.status };
  } catch (error) {
    throw new Error(`Request failed with error: ${error}`);
  }
};
