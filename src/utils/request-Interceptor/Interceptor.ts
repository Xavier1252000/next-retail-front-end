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
        const response = await resp.json();

        return { response, status: resp.status };
    } catch (error) {
        throw new Error(`Request failed with error: ${error}`);
    }
};
