import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { ExtensionCommandContext, ExtensionContext } from "@oh-my-pi/pi-coding-agent";
import {
  DEFAULT_PROVIDER_NAMES,
  deleteCustomProviderName,
  handleProviderRenameCommand,
  loadCustomProviderNames,
  resolveProviderName,
  saveCustomProviderName,
  updateStatus,
} from "./index";

describe("DEFAULT_PROVIDER_NAMES", () => {
  it("mapeia os principais provedores para rótulos amigáveis", () => {
    expect(DEFAULT_PROVIDER_NAMES["google-antigravity"]).toBe("Antigravity");
    expect(DEFAULT_PROVIDER_NAMES["openai-codex"]).toBe("ChatGPT Plus/Pro");
    expect(DEFAULT_PROVIDER_NAMES["xiaomi-token-plan-sgp"]).toBe("Xiaomi Token Plan");
    expect(DEFAULT_PROVIDER_NAMES["anthropic"]).toBe("Anthropic");
    expect(DEFAULT_PROVIDER_NAMES["deepseek"]).toBe("DeepSeek");
    expect(DEFAULT_PROVIDER_NAMES["github-copilot"]).toBe("GitHub Copilot");
  });
});

describe("resolveProviderName", () => {
  it("prioriza o nome customizado do usuário", () => {
    const custom = { "google-antigravity": "Meu Antigravity", "openai-codex": "Codex Pro" };
    expect(resolveProviderName("google-antigravity", custom)).toBe("Meu Antigravity");
    expect(resolveProviderName("openai-codex", custom)).toBe("Codex Pro");
  });

  it("utiliza o dicionário padrão quando não há customização", () => {
    expect(resolveProviderName("google-antigravity", {})).toBe("Antigravity");
    expect(resolveProviderName("openai-codex", {})).toBe("ChatGPT Plus/Pro");
    expect(resolveProviderName("anthropic", {})).toBe("Anthropic");
  });

  it("recorre ao nome oficial ou ID quando o provedor for desconhecido", () => {
    expect(resolveProviderName("provedor-inexistente", {})).toBe("provedor-inexistente");
  });
});

describe("loadCustomProviderNames, saveCustomProviderName e deleteCustomProviderName", () => {
  const tempDir = path.join(os.tmpdir(), "omp-provider-test-" + Date.now());
  const tempConfigFile = path.join(tempDir, "provider-names.json");

  beforeEach(() => {
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("retorna objeto vazio se o arquivo não existir", () => {
    expect(loadCustomProviderNames(path.join(tempDir, "inexistente.json"))).toEqual({});
  });

  it("salva, lê e remove apelidos customizados no arquivo JSON", () => {
    saveCustomProviderName("google-antigravity", "Google Gemini Flash", tempConfigFile);
    saveCustomProviderName("anthropic", "Claude 3.5", tempConfigFile);

    let loaded = loadCustomProviderNames(tempConfigFile);
    expect(loaded["google-antigravity"]).toBe("Google Gemini Flash");
    expect(loaded["anthropic"]).toBe("Claude 3.5");

    const deleted = deleteCustomProviderName("anthropic", tempConfigFile);
    expect(deleted).toBe(true);

    loaded = loadCustomProviderNames(tempConfigFile);
    expect(loaded["anthropic"]).toBeUndefined();
    expect(loaded["google-antigravity"]).toBe("Google Gemini Flash");

    const deleteAgain = deleteCustomProviderName("anthropic", tempConfigFile);
    expect(deleteAgain).toBe(false);
  });
});

describe("updateStatus", () => {
  it("define o nome do provedor no segmento status", () => {
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

describe("handleProviderRenameCommand", () => {
  it("exibe ajuda quando executado sem argumentos", async () => {
    let notifiedMsg = "";

    const fakeCmdCtx = {
      models: {
        current: () => ({ provider: "google-antigravity", id: "gemini-3.8-flash" }),
      },
      ui: {
        notify: (msg: string) => {
          notifiedMsg = msg;
        },
        setStatus: () => {},
      },
    } as unknown as ExtensionCommandContext;

    await handleProviderRenameCommand("", fakeCmdCtx);
    expect(notifiedMsg).toContain("Active provider: google-antigravity");
    expect(notifiedMsg).toContain("/provider-rename <new-name>");
  });

  it("renomeia o provedor ativo quando passado apenas o novo nome", async () => {
    let notifiedMsg = "";
    let updatedStatus: string | undefined;

    const fakeCmdCtx = {
      models: {
        current: () => ({ provider: "google-antigravity", id: "gemini-3.8-flash" }),
      },
      ui: {
        notify: (msg: string) => {
          notifiedMsg = msg;
        },
        setStatus: (_key: string, text?: string) => {
          updatedStatus = text;
        },
      },
    } as unknown as ExtensionCommandContext;

    await handleProviderRenameCommand("Google Gemini", fakeCmdCtx);
    expect(notifiedMsg).toContain('Renamed provider "google-antigravity" to "Google Gemini"');
    expect(updatedStatus).toBe("Google Gemini");

    // Reset em seguida para restaurar o estado padrão do ambiente de teste
    await handleProviderRenameCommand("reset google-antigravity", fakeCmdCtx);
    expect(updatedStatus).toBe("Antigravity");
  });

  it("renomeia um provedor específico quando passado id e novo nome", async () => {
    let notifiedMsg = "";

    const fakeCmdCtx = {
      models: {
        current: () => ({ provider: "openai-codex", id: "gpt-6-luna" }),
      },
      ui: {
        notify: (msg: string) => {
          notifiedMsg = msg;
        },
        setStatus: () => {},
      },
    } as unknown as ExtensionCommandContext;

    await handleProviderRenameCommand("anthropic Claude AI", fakeCmdCtx);
    expect(notifiedMsg).toContain('Renamed provider "anthropic" to "Claude AI"');

    await handleProviderRenameCommand("reset anthropic", fakeCmdCtx);
    expect(notifiedMsg).toContain('Reset "anthropic" to default');
  });

  it("lista os apelidos customizados via comando list", async () => {
    let notifiedMsg = "";

    const fakeCmdCtx = {
      models: {
        current: () => undefined,
      },
      ui: {
        notify: (msg: string) => {
          notifiedMsg = msg;
        },
        setStatus: () => {},
      },
    } as unknown as ExtensionCommandContext;

    await handleProviderRenameCommand("list", fakeCmdCtx);
    expect(notifiedMsg.length).toBeGreaterThan(0);
  });
});
