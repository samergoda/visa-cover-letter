import {
  DEFAULT_MODEL,
  type AppSettings,
  type GeneratedLetter,
  type OpenRouterModel,
} from "@/types";

const STORAGE_KEYS = {
  model: "visa-cover-letter-model",
  history: "visa-cover-letter-history",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getSelectedModel(): OpenRouterModel {
  if (!isBrowser()) return DEFAULT_MODEL;
  const stored = localStorage.getItem(STORAGE_KEYS.model);
  if (
    stored === "deepseek/deepseek-chat-v3" ||
    stored === "openai/gpt-4o-mini" ||
    stored === "qwen/qwen-3-235b-a22b" ||
    stored === "google/gemini-2.5-flash"
  ) {
    return stored;
  }
  return DEFAULT_MODEL;
}

export function setSelectedModel(model: OpenRouterModel): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.model, model);
}

export function getSettings(): AppSettings {
  return {
    model: getSelectedModel(),
  };
}

export function saveSettings(settings: Partial<AppSettings>): void {
  if (settings.model !== undefined) {
    setSelectedModel(settings.model);
  }
}

export function getHistory(): GeneratedLetter[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GeneratedLetter[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveToHistory(letter: GeneratedLetter): void {
  if (!isBrowser()) return;
  const history = getHistory();
  const updated = [letter, ...history].slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(updated));
}

export function deleteFromHistory(id: string): void {
  if (!isBrowser()) return;
  const updated = getHistory().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(updated));
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.history);
}

export function getHistoryItem(id: string): GeneratedLetter | undefined {
  return getHistory().find((item) => item.id === id);
}
