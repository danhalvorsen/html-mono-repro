// src/utils/httpRequestBuilder.ts
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface HttpRequestOptions {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
}

export class HttpRequestBuilder {
  private opts: HttpRequestOptions = {
    method: "GET",
    url: "",
    headers: {},
    timeoutMs: 15000
  };

  static create(): HttpRequestBuilder {
    return new HttpRequestBuilder();
  }

  setUrl(url: string) {
    this.opts.url = url;
    return this;
  }

  setMethod(method: HttpMethod) {
    this.opts.method = method;
    return this;
  }

  setHeader(key: string, value: string) {
    this.opts.headers![key] = value;
    return this;
  }

  setJsonBody(body: any) {
    this.opts.body = JSON.stringify(body);
    this.setHeader("Content-Type", "application/json");
    return this;
  }

  setTimeout(ms: number) {
    this.opts.timeoutMs = ms;
    return this;
  }

  async send<T = any>(): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.opts.timeoutMs);

    const res = await fetch(this.opts.url, {
      method: this.opts.method,
      headers: this.opts.headers,
      body: this.opts.body,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    return await res.json() as T;
  }
}
