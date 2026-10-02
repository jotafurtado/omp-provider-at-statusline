import { getProviderDefinition } from "@oh-my-pi/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@oh-my-pi/pi-coding-agent";

const STATUS_KEY = "omp-provider-at-statusline";

export function sanitizeProviderName(provider: string, rawName?: string): string {
  if (provider === "openai-codex") {
    return "ChatGPT Plus/Pro";
  }
  const name = rawName || provider;
  return name.replace(/\s*\(.*?\)/g, "").trim();
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

  const providerRawName = getProviderDefinition(model.provider)?.name;
  const statusText = sanitizeProviderName(model.provider, providerRawName);

  if (statusText !== lastStatusText) {
    lastStatusText = statusText;
    ctx.ui.setStatus(STATUS_KEY, statusText);
  }
}

export default function ompProviderAtStatusline(pi: ExtensionAPI): void {
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
