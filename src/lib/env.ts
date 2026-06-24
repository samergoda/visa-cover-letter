export function getOpenRouterApiKey(): string {
  return process.env.OPENROUTER_API_KEY?.trim() ?? "";
}

export function isOpenRouterConfigured(): boolean {
  return getOpenRouterApiKey().length > 0;
}
