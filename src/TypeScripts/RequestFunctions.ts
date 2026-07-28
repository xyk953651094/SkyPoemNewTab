// 网络请求

// 1. 定义更精确的错误类型
export class HttpRequestError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
        public readonly responseBody?: string
    ) {
        super(message);
        this.name = "HttpRequestError";
    }
}

// 2. 参数类型收紧，支持泛型
export async function httpRequest<T = any>(
    url: string,
    options: {
        method?: "GET" | "POST"; // 默认 GET
        headers?: Record<string, string>;
        data?: Record<string, any>;
        timeout?: number; // 可配置超时
    } = {}
): Promise<T> {
    const {
        method = "GET",
        headers = {},
        data = {},
        timeout = 5000,
    } = options;
    
    // 轻量验证（只检查必填 url）
    if (!url || typeof url !== "string") {
        throw new HttpRequestError("Invalid URL");
    }
    
    // 构建请求配置
    // 注意：仅非 GET 请求（带 JSON body）才设置 Content-Type: application/json。
    // 给无 body 的 GET 加该头会触发 CORS 预检（application/json 非安全列表值），
    // 部分接口（如 jinrishici.com）的预检返回 403 导致请求失败。
    const isGet = method === "GET";
    const config: RequestInit = {
        method,
        headers: isGet
            ? {...headers}
            : {"Content-Type": "application/json", ...headers},
    };
    
    // 处理 URL 和 body
    let requestUrl = url;
    if (isGet) {
        // 过滤掉 undefined 和 null，但保留 false/0/"" 作为有意义的值
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        }
        const queryString = params.toString();
        if (queryString) {
            // 智能拼接：处理已有 ? 和 # 的情况
            const urlHasQuery = url.includes("?");
            const urlHasHash = url.includes("#");
            if (urlHasHash) {
                const [base, hash] = url.split("#");
                requestUrl = `${base}${urlHasQuery ? "&" : "?"}${queryString}#${hash}`;
            } else {
                requestUrl = `${url}${urlHasQuery ? "&" : "?"}${queryString}`;
            }
        }
    } else {
        config.body = JSON.stringify(data);
    }
    
    // 超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;
    
    // 统一清理函数
    const cleanup = () => clearTimeout(timeoutId);
    
    try {
        const response = await fetch(requestUrl, config);
        cleanup();
        
        // 解析响应体（无论成功或失败，都可能需要 body 内容）
        let responseBody: string = "";
        let parsedData: any = null;
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            try {
                parsedData = await response.json();
                responseBody = JSON.stringify(parsedData);
            } catch {
                // json 解析失败，降级为 text
                responseBody = await response.text();
            }
        } else {
            responseBody = await response.text();
        }
        
        if (!response.ok) {
            throw new HttpRequestError(
                `Request failed: ${response.status} ${response.statusText}`,
                response.status,
                responseBody
            );
        }
        
        // 如果响应是 JSON 则返回解析后对象，否则返回原始文本（兼容非 JSON）
        return (parsedData !== null ? parsedData : responseBody) as T;
    } catch (error: any) {
        cleanup();
        
        if (error.name === "AbortError") {
            throw new HttpRequestError(`Request timeout after ${timeout}ms`);
        }
        if (error instanceof HttpRequestError) {
            throw error;
        }
        throw new HttpRequestError(`Network error: ${error.message}`);
    }
}