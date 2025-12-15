// src/ai/deepseekRequestBuilder.ts
import { HttpRequestBuilder } from "./httpRequestBuilder.js";

export interface DeepSeekOptions {
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export class DeepSeekRequestBuilder {
  private opts: DeepSeekOptions = {
    model: "deepseek-chat",
    prompt: ""
  };

  static create() {
    return new DeepSeekRequestBuilder();
  }

  setModel(model: string) {
    this.opts.model = model;
    return this;
  }

  setPrompt(prompt: string) {
    this.opts.prompt = prompt;
    return this;
  }

  setSystemPrompt(sys: string) {
    this.opts.system = sys;
    return this;
  }

  setTemperature(t: number) {
    this.opts.temperature = t;
    return this;
  }

  setMaxTokens(n: number) {
    this.opts.maxTokens = n;
    return this;
  }

  async execute(): Promise<string> {
    const req = HttpRequestBuilder.create()
      .setUrl("http://localhost:11434/api/generate")
      .setMethod("POST")
      .setJsonBody({
        model: this.opts.model,
        prompt: this.opts.prompt,
        system: this.opts.system,
        temperature: this.opts.temperature,
        max_tokens: this.opts.maxTokens,
        stream: false
      });

    const json = await req.send<any>();
    return json.response ?? "";
  }
}
