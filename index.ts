import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { getProviderDefinition } from "@oh-my-pi/pi-ai";
import type { ExtensionAPI, ExtensionCommandContext, ExtensionContext } from "@oh-my-pi/pi-coding-agent";

const STATUS_KEY = "omp-provider-at-statusline";
const CONFIG_FILE_NAME = "provider-names.json";

export const DEFAULT_PROVIDER_NAMES: Record<string, string> = {
  "openai-codex": "ChatGPT Plus/Pro",
  "openai-codex-device": "ChatGPT Plus/Pro",
  "anthropic": "Anthropic",
  "zai": "Z.AI",
  "zai-coding-plan": "Z.AI",
  "kimi-code": "Kimi Code",
  "openrouter": "OpenRouter",
  "github-copilot": "GitHub Copilot",
  "cursor": "Cursor",
  "devin": "Devin",
  "google-antigravity": "Antigravity",
  "google-gemini-cli": "Google Cloud Code",
  "xai": "xAI",
  "xai-oauth": "xAI",
  "gitlab-duo": "GitLab Duo",
  "gitlab-duo-agent": "GitLab Duo Agent",
  "alibaba-coding-plan": "Alibaba",
  "alibaba-token-plan": "QwenCloud",
  "aiand": "ai&",
  "abliteration": "Abliteration",
  "zhipu-coding-plan": "Zhipu",
  "umans": "Umans AI",
  "qwen-portal": "Qwen Portal",
  "sakana": "Sakana AI",
  "minimax-code": "MiniMax",
  "minimax-code-cn": "MiniMax",
  "xiaomi": "Xiaomi",
  "xiaomi-token-plan-sgp": "Xiaomi Token Plan",
  "xiaomi-token-plan-ams": "Xiaomi Token Plan",
  "xiaomi-token-plan-cn": "Xiaomi Token Plan",
  "firepass": "Fire Pass",
  "cline-pass": "ClinePass",
  "factory-droid": "Factory Droid",
  "commandcode": "Command Code",
  "charm-hyper": "Charm Hyper",
  "deepseek": "DeepSeek",
  "stepfun": "StepFun",
  "muse-code": "Muse Code",
  "meta": "Meta",
  "moonshot": "Moonshot",
  "cerebras": "Cerebras",
  "baseten": "Baseten",
  "helmcode": "Helmcode",
  "fireworks": "Fireworks",
  "together": "Together",
  "nvidia": "NVIDIA",
  "novita": "Novita",
  "deepinfra": "DeepInfra",
  "huggingface": "Hugging Face",
  "perplexity": "Perplexity",
  "qianfan": "Qianfan",
  "venice": "Venice",
  "siliconflow": "SiliconFlow",
  "siliconflow-cn": "SiliconFlow",
  "synthetic": "Synthetic",
  "nanogpt": "NanoGPT",
  "wafer-serverless": "Wafer",
  "coreweave": "CoreWeave",
  "vercel-ai-gateway": "Vercel",
  "cloudflare-ai-gateway": "Cloudflare",
  "litellm": "LiteLLM",
  "kilo": "Kilo",
  "zenmux": "ZenMux",
  "opencode-zen": "OpenCode Zen",
  "opencode-go": "OpenCode Go",
  "yolo-auto": "Yolo-Auto",
  "tavily": "Tavily",
  "kagi": "Kagi",
  "exa": "Exa",
  "parallel": "Parallel",
  "typesafe": "TypeSafe",
  "ollama": "Ollama",
  "ollama-cloud": "Ollama Cloud",
  "lm-studio": "LM Studio",
  "llama.cpp": "llama.cpp",
  "vllm": "vLLM",
  "gmi-cloud": "GMI Cloud",
  "stencil": "Stencil",
  "singularityapi-dev": "SingularityAPI",
  "singularityapi-tech": "SingularityAPI",
  "aimlapi": "AIML API",
  "amazon-bedrock": "Amazon Bedrock",
  "apple": "Apple",
  "azure": "Azure",
  "bedrock-mantle": "Bedrock Mantle",
  "google": "Google",
  "google-vertex": "Google Vertex",
  "groq": "Groq",
  "local": "Local",
  "minimax": "MiniMax",
  "mistral": "Mistral",
  "openai": "OpenAI",
  "web": "Web",
};

export function getCustomConfigPath(): string {
  return path.join(os.homedir(), ".omp", CONFIG_FILE_NAME);
}

export function loadCustomProviderNames(configPath = getCustomConfigPath()): Record<string, string> {
  try {
    if (!fs.existsSync(configPath)) {
      return {};
    }
    const content = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const result: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === "string" && value.trim().length > 0) {
          result[key] = value.trim();
        }
      }
      return result;
    }
  } catch {
    // Retorna vazio caso o arquivo esteja corrompido ou inacessível
  }
  return {};
}

export function saveCustomProviderName(
  providerId: string,
  customName: string,
  configPath = getCustomConfigPath(),
): void {
  const current = loadCustomProviderNames(configPath);
  current[providerId] = customName.trim();
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(current, null, 2), "utf-8");
}

export function deleteCustomProviderName(
  providerId: string,
  configPath = getCustomConfigPath(),
): boolean {
  const current = loadCustomProviderNames(configPath);
  if (!(providerId in current)) {
    return false;
  }
  delete current[providerId];
  fs.writeFileSync(configPath, JSON.stringify(current, null, 2), "utf-8");
  return true;
}

export function resolveProviderName(
  providerId: string,
  customNames: Record<string, string> = loadCustomProviderNames(),
): string {
  if (customNames[providerId]) {
    return customNames[providerId];
  }
  if (DEFAULT_PROVIDER_NAMES[providerId]) {
    return DEFAULT_PROVIDER_NAMES[providerId];
  }
  return getProviderDefinition(providerId)?.name || providerId;
}

let lastStatusText: string | undefined = undefined;

export function updateStatus(ctx: ExtensionContext): void {
  const model = ctx.models.current();
  if (!model) {
    if (lastStatusText !== undefined) {
      lastStatusText = undefined;
      ctx.ui.setStatus(STATUS_KEY, undefined);
    }
    return;
  }

  const customNames = loadCustomProviderNames();
  const statusText = resolveProviderName(model.provider, customNames);

  if (statusText !== lastStatusText) {
    lastStatusText = statusText;
    ctx.ui.setStatus(STATUS_KEY, statusText);
  }
}

export async function handleProviderRenameCommand(
  args: string,
  ctx: ExtensionCommandContext,
): Promise<void> {
  const raw = args.trim();
  const currentModel = ctx.models.current();

  if (raw === "list") {
    const custom = loadCustomProviderNames();
    const entries = Object.entries(custom);
    if (entries.length === 0) {
      ctx.ui.notify("No custom provider renames found. Using built-in defaults.", "info");
      return;
    }
    const lines = entries.map(([id, name]) => `${id}: "${name}"`).join("\n");
    ctx.ui.notify(`Custom provider names:\n${lines}`, "info");
    return;
  }

  if (raw.startsWith("reset")) {
    const parts = raw.split(/\s+/);
    const targetProvider = parts[1] || currentModel?.provider;
    if (!targetProvider) {
      ctx.ui.notify("No active provider to reset. Specify: /provider-rename reset <provider-id>", "warning");
      return;
    }
    const removed = deleteCustomProviderName(targetProvider);
    lastStatusText = undefined;
    updateStatus(ctx);
    if (removed) {
      const fallback = resolveProviderName(targetProvider);
      ctx.ui.notify(`Reset "${targetProvider}" to default: "${fallback}".`, "info");
    } else {
      ctx.ui.notify(`No custom rename found for "${targetProvider}".`, "info");
    }
    return;
  }

  if (!raw) {
    const currentId = currentModel?.provider;
    const currentName = currentId ? resolveProviderName(currentId) : undefined;
    const helpMsg = currentId
      ? `Active provider: ${currentId} ("${currentName}")\nUsage:\n  /provider-rename <new-name>\n  /provider-rename <provider-id> <new-name>\n  /provider-rename reset [provider-id]\n  /provider-rename list`
      : "Usage:\n  /provider-rename <provider-id> <new-name>\n  /provider-rename reset [provider-id]\n  /provider-rename list";
    ctx.ui.notify(helpMsg, "info");
    return;
  }

  const parts = raw.split(/\s+/);
  let targetProvider: string;
  let newName: string;

  if (parts.length >= 2 && (parts[0] in DEFAULT_PROVIDER_NAMES || Boolean(getProviderDefinition(parts[0])))) {
    targetProvider = parts[0];
    newName = parts.slice(1).join(" ");
  } else if (currentModel?.provider) {
    targetProvider = currentModel.provider;
    newName = raw;
  } else if (parts.length >= 2) {
    targetProvider = parts[0];
    newName = parts.slice(1).join(" ");
  } else {
    ctx.ui.notify("Specify both provider and name: /provider-rename <provider-id> <new-name>", "warning");
    return;
  }

  saveCustomProviderName(targetProvider, newName);
  lastStatusText = undefined;
  updateStatus(ctx);
  ctx.ui.notify(`Renamed provider "${targetProvider}" to "${newName}".`, "info");
}

export default function ompProviderAtStatusline(pi: ExtensionAPI): void {
  pi.registerCommand("provider-rename", {
    description: "Customize or reset the display name of AI providers on the statusline",
    handler: async (args, ctx) => {
      await handleProviderRenameCommand(args, ctx);
    },
  });

  pi.on("session_start", (_event, ctx: ExtensionContext) => {
    if (ctx.mode !== "tui" || ctx.agent.kind === "sub") return;

    lastStatusText = undefined;
    updateStatus(ctx);

    ctx.setInterval(() => {
      updateStatus(ctx);
    }, 200);
  });

  pi.on("turn_start", (_event, ctx: ExtensionContext) => {
    if (ctx.mode !== "tui" || ctx.agent.kind === "sub") return;
    updateStatus(ctx);
  });

  pi.on("session_shutdown", (_event, ctx: ExtensionContext) => {
    if (ctx.mode === "tui" && ctx.agent.kind !== "sub") {
      ctx.ui.setStatus(STATUS_KEY, undefined);
      lastStatusText = undefined;
    }
  });
}
