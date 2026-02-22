// Configuración del cliente de Anthropic (Claude Vision)
// Utilizado en Task 3.2: /api/process-receipt
// La clave se lee exclusivamente desde variables de entorno — nunca hardcodeada.

export const ANTHROPIC_MODEL = "claude-opus-4-5";

export function getAnthropicApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("Falta variable de entorno: ANTHROPIC_API_KEY");
  }
  return key;
}
