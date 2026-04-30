// Transcripción fonética muy ligera (aproximación didáctica del inglés -> sonidos hispanos)
// No es IPA real, sino una lectura "como suena" para hispanohablantes.
// Se ejecuta 100% local, sin red.

const PHONETIC_MAP: Array<[RegExp, string]> = [
  // Dígrafos comunes primero
  [/tion\b/gi, "shon"],
  [/sion\b/gi, "shon"],
  [/ough\b/gi, "of"],
  [/aught/gi, "ot"],
  [/ought/gi, "ot"],
  [/eigh/gi, "ei"],
  [/tch/gi, "ch"],
  [/sch/gi, "sk"],
  [/shr/gi, "shr"],
  [/thr/gi, "zr"],
  [/wh/gi, "u"],
  [/ph/gi, "f"],
  [/ck/gi, "k"],
  [/qu/gi, "ku"],
  [/sh/gi, "sh"],
  [/ch/gi, "ch"],
  [/th/gi, "z"],
  [/ng\b/gi, "ng"],
  [/ee/gi, "i"],
  [/ea/gi, "i"],
  [/oo/gi, "u"],
  [/ou/gi, "au"],
  [/ow/gi, "au"],
  [/ai/gi, "ei"],
  [/ay/gi, "ei"],
  [/ey\b/gi, "i"],
  [/oy/gi, "oi"],
  [/oi/gi, "oi"],
  [/igh/gi, "ai"],
  [/ar\b/gi, "ar"],
  [/er\b/gi, "er"],
  [/or\b/gi, "or"],
  [/ir\b/gi, "er"],
  [/ur\b/gi, "er"],

  // Letras simples
  [/y\b/gi, "i"],
  [/y/gi, "i"],
  [/j/gi, "y"],
  [/v/gi, "v"],
  [/w/gi, "u"],
  [/z/gi, "s"],
  [/x/gi, "ks"],
  [/h\b/gi, ""],
];

const CACHE = new Map<string, string>();

export const wordPhonetic = (word: string): string => {
  const key = word.toLowerCase();
  const cached = CACHE.get(key);
  if (cached !== undefined) return cached;
  let s = key;
  for (const [re, rep] of PHONETIC_MAP) s = s.replace(re, rep);
  CACHE.set(key, s);
  return s;
};

export const linePhonetic = (line: string): string => {
  return line
    .split(/(\s+)/)
    .map((tok) => (/\s+/.test(tok) ? tok : wordPhonetic(tok.replace(/[^\w']/g, "")) || tok))
    .join("");
};
