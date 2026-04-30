// Pipeline completo: archivo -> Whisper -> traducción -> fonética -> guardar
import type { Song, LyricLine } from "./types";
import { transcribe, type WhisperProgress } from "./whisper";
import { translateLines } from "./translate";
import { linePhonetic } from "./phonetic";
import { saveSong, updateSong } from "./db";

export interface ProcessProgress {
  stage: "init" | "whisper" | "translate" | "phonetic" | "saving" | "done" | "error";
  percent: number;
  message: string;
}

const getMediaDuration = (blob: Blob): Promise<number> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const el = document.createElement("audio");
    el.preload = "metadata";
    el.src = url;
    el.onloadedmetadata = () => {
      const d = el.duration;
      URL.revokeObjectURL(url);
      resolve(isFinite(d) ? d : 0);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
  });

export const processSong = async (
  file: File,
  targetLang: string,
  sourceLang: string,
  onProgress: (p: ProcessProgress) => void
): Promise<Song> => {
  const id = crypto.randomUUID();
  const mediaType: "audio" | "video" = file.type.startsWith("video") ? "video" : "audio";
  const title = file.name.replace(/\.[^.]+$/, "");

  // 1. Crear registro inicial "processing"
  const duration = await getMediaDuration(file);
  const initial: Song = {
    id,
    title,
    mediaType,
    mediaBlob: file,
    mimeType: file.type || (mediaType === "video" ? "video/mp4" : "audio/mpeg"),
    sourceLang,
    targetLang,
    lines: [],
    duration,
    status: "processing",
    statusMessage: "Iniciando…",
    createdAt: Date.now(),
  };
  await saveSong(initial);
  onProgress({ stage: "init", percent: 2, message: "Archivo guardado localmente" });

  try {
    // 2. Transcribir con Whisper (ocupa el 60% del progreso)
    const onWhisper = (p: WhisperProgress) => {
      let percent = 5;
      if (p.stage === "downloading") percent = 5 + (p.progress ?? 0) * 0.4;
      else if (p.stage === "transcribing") percent = 50;
      else if (p.stage === "done") percent = 65;
      onProgress({ stage: "whisper", percent, message: p.message });
    };
    const result = await transcribe(file, sourceLang, onWhisper);

    if (!result.chunks.length) {
      throw new Error("No se detectó voz en el archivo");
    }

    // 3. Traducir líneas
    onProgress({ stage: "translate", percent: 70, message: "Traduciendo líneas…" });
    const texts = result.chunks.map((c) => c.text);
    const translations =
      sourceLang === targetLang
        ? texts.slice()
        : await translateLines(texts, sourceLang, targetLang, (done, total) => {
            const p = 70 + (done / total) * 20;
            onProgress({ stage: "translate", percent: p, message: `Traduciendo ${done}/${total}…` });
          });

    // 4. Generar fonética
    onProgress({ stage: "phonetic", percent: 92, message: "Generando pronunciación…" });
    const lines: LyricLine[] = result.chunks.map((c, i) => ({
      start: c.start,
      end: c.end || (result.chunks[i + 1]?.start ?? c.start + 3),
      text: c.text,
      phonetic: sourceLang === "en" ? linePhonetic(c.text) : undefined,
      translation: translations[i] || "",
    }));

    onProgress({ stage: "saving", percent: 97, message: "Guardando en el teléfono…" });
    const final = (await updateSong(id, {
      lines,
      status: "ready",
      statusMessage: "Listo",
    })) as Song;

    onProgress({ stage: "done", percent: 100, message: "¡Listo!" });
    return final;
  } catch (err: any) {
    await updateSong(id, {
      status: "error",
      statusMessage: err?.message || "Error procesando",
    });
    onProgress({
      stage: "error",
      percent: 0,
      message: err?.message || "Error procesando la canción",
    });
    throw err;
  }
};
