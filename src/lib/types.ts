// Tipos compartidos de Inglés Cantando

export interface LyricLine {
  /** segundos */
  start: number;
  /** segundos */
  end: number;
  /** texto original (idioma fuente, normalmente inglés) */
  text: string;
  /** transcripción fonética (IPA aproximado) */
  phonetic?: string;
  /** traducción al idioma seleccionado */
  translation?: string;
}

export interface Song {
  id: string;
  title: string;
  /** "audio" | "video" */
  mediaType: "audio" | "video";
  /** Blob del archivo original guardado en IndexedDB */
  mediaBlob: Blob;
  /** mime original */
  mimeType: string;
  /** idioma detectado / fuente */
  sourceLang: string;
  /** idioma de traducción seleccionado al procesar */
  targetLang: string;
  /** líneas con timestamps */
  lines: LyricLine[];
  /** duración en segundos */
  duration: number;
  /** Estado del procesamiento */
  status: "processing" | "ready" | "error";
  /** Mensaje de error o progreso */
  statusMessage?: string;
  createdAt: number;
}

export interface PlayerSettings {
  lyricColor: string;
  lyricSize: number; // px
  phoneticColor: string;
  phoneticSize: number;
  translationColor: string;
  translationSize: number;
  showPhonetic: boolean;
  showTranslation: boolean;
  playbackRate: number;
}

export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  lyricColor: "#ffffff",
  lyricSize: 28,
  phoneticColor: "#7dd3fc",
  phoneticSize: 16,
  translationColor: "#fbcfe8",
  translationSize: 18,
  showPhonetic: true,
  showTranslation: true,
  playbackRate: 1,
};
