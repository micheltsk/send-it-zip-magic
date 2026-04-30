// Whisper 100% local en el navegador con transformers.js
// Modelo: Xenova/whisper-tiny (~75 MB) — multiidioma con timestamps.

import { pipeline, env, type AutomaticSpeechRecognitionPipeline } from "@huggingface/transformers";

// Permitir modelos remotos desde Hugging Face Hub
env.allowLocalModels = false;
env.useBrowserCache = true;

let asrPromise: Promise<AutomaticSpeechRecognitionPipeline> | null = null;

export interface WhisperProgress {
  stage: "loading-model" | "downloading" | "transcribing" | "done";
  progress?: number; // 0-100
  message: string;
}

export const getWhisper = (
  onProgress?: (p: WhisperProgress) => void
): Promise<AutomaticSpeechRecognitionPipeline> => {
  if (!asrPromise) {
    onProgress?.({ stage: "loading-model", message: "Preparando modelo Whisper…" });
    asrPromise = pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny",
      {
        // @ts-ignore - progress_callback existe en runtime
        progress_callback: (p: any) => {
          if (p.status === "progress" && typeof p.progress === "number") {
            onProgress?.({
              stage: "downloading",
              progress: Math.round(p.progress),
              message: `Descargando modelo (${Math.round(p.progress)}%) — solo la primera vez`,
            });
          } else if (p.status === "ready") {
            onProgress?.({ stage: "loading-model", message: "Modelo listo" });
          }
        },
      }
    ) as Promise<AutomaticSpeechRecognitionPipeline>;
  }
  return asrPromise;
};

/** Decodifica un Blob de audio/video a Float32Array PCM mono 16kHz */
export const decodeAudioToPCM = async (blob: Blob): Promise<Float32Array> => {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
  // Whisper espera 16kHz
  const ctx = new AudioCtx({ sampleRate: 16000 });
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
    // Mezclar a mono
    if (decoded.numberOfChannels === 1) {
      const out = new Float32Array(decoded.length);
      decoded.copyFromChannel(out, 0);
      return out;
    }
    const left = decoded.getChannelData(0);
    const right = decoded.getChannelData(1);
    const out = new Float32Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) out[i] = (left[i] + right[i]) / 2;
    return out;
  } finally {
    ctx.close().catch(() => {});
  }
};

export interface TranscribedChunk {
  text: string;
  start: number;
  end: number;
}

export interface TranscriptionResult {
  text: string;
  chunks: TranscribedChunk[];
  language: string;
}

export const transcribe = async (
  blob: Blob,
  language: string | "auto",
  onProgress?: (p: WhisperProgress) => void
): Promise<TranscriptionResult> => {
  const asr = await getWhisper(onProgress);
  onProgress?.({ stage: "transcribing", message: "Decodificando audio…" });
  const audio = await decodeAudioToPCM(blob);
  onProgress?.({ stage: "transcribing", message: "Transcribiendo con Whisper… (puede tardar 1-3 min en móvil)" });

  const opts: any = {
    return_timestamps: true,
    chunk_length_s: 30,
    stride_length_s: 5,
  };
  if (language && language !== "auto") {
    opts.language = language;
    opts.task = "transcribe";
  }

  const result = (await asr(audio, opts)) as any;
  onProgress?.({ stage: "done", message: "Transcripción completada" });

  const chunks: TranscribedChunk[] = (result.chunks || []).map((c: any) => ({
    text: (c.text || "").trim(),
    start: c.timestamp?.[0] ?? 0,
    end: c.timestamp?.[1] ?? 0,
  })).filter((c: TranscribedChunk) => c.text.length > 0);

  return {
    text: result.text || "",
    chunks,
    language: language === "auto" ? "en" : language,
  };
};
