import { describe, expect, it } from "bun:test";
import type { ExtensionContext } from "@oh-my-pi/pi-coding-agent";
import { sanitizeProviderName, updateStatus } from "./index";

describe("sanitizeProviderName", () => {
  it("retorna ChatGPT Plus/Pro para openai-codex", () => {
    expect(sanitizeProviderName("openai-codex", "ChatGPT Plus/Pro (Codex Subscription)")).toBe("ChatGPT Plus/Pro");
    expect(sanitizeProviderName("openai-codex")).toBe("ChatGPT Plus/Pro");
  });

  it("remove trechos entre parênteses para outros provedores", () => {
    expect(sanitizeProviderName("google-antigravity", "Antigravity (Gemini 3, Claude, GPT-OSS)")).toBe("Antigravity");
    expect(sanitizeProviderName("xiaomi-token-plan-sgp", "Xiaomi Token Plan (Singapore)")).toBe("Xiaomi Token Plan");
  });

  it("mantém nomes sem parênteses inalterados", () => {
    expect(sanitizeProviderName("anthropic", "Anthropic")).toBe("Anthropic");
  });

  it("usa o identificador do provedor quando o nome bruto não for informado", () => {
    expect(sanitizeProviderName("ollama")).toBe("ollama");
  });
});

describe("updateStatus", () => {
  it("define apenas o nome amigável do provedor no segmento status", () => {
    let currentStatus: string | undefined;

    const fakeCtx = {
      models: {
        current: () => ({
          provider: "google-antigravity",
          id: "gemini-3.8-flash",
          name: "gemini-3.8-flash",
        }),
      },
      ui: {
        setStatus: (_key: string, text: string | undefined) => {
          currentStatus = text;
        },
      },
    } as unknown as ExtensionContext;

    updateStatus(fakeCtx);
    expect<string | undefined>(currentStatus).toBe("Antigravity");
  });

  it("limpa o status quando não houver modelo ativo", () => {
    let currentStatus: string | undefined = "anterior";

    const fakeCtx = {
      models: {
        current: () => undefined,
      },
      ui: {
        setStatus: (_key: string, text: string | undefined) => {
          currentStatus = text;
        },
      },
    } as unknown as ExtensionContext;

    updateStatus(fakeCtx);
    expect<string | undefined>(currentStatus).toBeUndefined();
  });
});
