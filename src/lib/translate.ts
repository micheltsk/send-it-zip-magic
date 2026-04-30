// Traducción gratuita usando instancias públicas de LibreTranslate.
// Sin API key, sin coste. Si una instancia falla probamos la siguiente.

const ENDPOINTS = [
  "https://translate.fedilab.app/translate",
  "https://lt.blitzw.in/translate",
  "https://libretranslate.de/translate",
  "https://translate.terraprint.co/translate",
];

export const translateText = async (
  text: string,
  source: string,
  target: string,
  signal?: AbortSignal
): Promise<string> => {
  if (!text.trim() || source === target) return text;

  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, source, target, format: "text" }),
        signal,
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.translatedText) return data.translatedText as string;
    } catch {
      // try next endpoint
    }
  }
  // Fallback: devolver original si ninguna instancia respondió
  return text;
};

/** Traduce líneas en lote agrupadas para reducir requests */
export const translateLines = async (
  lines: string[],
  source: string,
  target: string,
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal
): Promise<string[]> => {
  if (source === target) return lines.slice();
  const SEP = "\n||\n";
  const BATCH = 20;
  const results: string[] = [];
  for (let i = 0; i < lines.length; i += BATCH) {
    const chunk = lines.slice(i, i + BATCH);
    const joined = chunk.join(SEP);
    const translated = await translateText(joined, source, target, signal);
    const parts = translated.split(SEP);
    if (parts.length === chunk.length) {
      results.push(...parts);
    } else {
      // si la separación falló, traducimos línea a línea
      for (const ln of chunk) {
        results.push(await translateText(ln, source, target, signal));
      }
    }
    onProgress?.(Math.min(i + BATCH, lines.length), lines.length);
  }
  return results;
};
