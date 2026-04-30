import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  /** elemento <audio> o <video> en reproducción */
  mediaEl: HTMLMediaElement | null;
  className?: string;
}

/** Visualizador animado: barras de frecuencia + halo central */
export const AudioVisualizer = ({ mediaEl, className }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<{
    audioCtx: AudioContext;
    analyser: AnalyserNode;
    source: MediaElementAudioSourceNode;
  } | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!mediaEl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    // Web Audio setup (una vez por elemento)
    if (!ctxRef.current) {
      try {
        const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
        const audioCtx = new AudioCtx();
        const source = audioCtx.createMediaElementSource(mediaEl);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        ctxRef.current = { audioCtx, analyser, source };
      } catch (e) {
        // ya conectado o no permitido
      }
    }

    const analyser = ctxRef.current?.analyser;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    const c = canvas.getContext("2d")!;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      c.clearRect(0, 0, W, H);

      if (analyser && data) analyser.getByteFrequencyData(data);

      const cx = W / 2;
      const cy = H / 2;
      const baseR = Math.min(W, H) * 0.18;

      // Halo central pulsante
      const energy = data ? data.reduce((a, b) => a + b, 0) / data.length / 255 : 0.3;
      const r = baseR + energy * baseR * 0.6;
      const grad = c.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
      grad.addColorStop(0, `hsla(320, 100%, 70%, ${0.5 + energy * 0.4})`);
      grad.addColorStop(0.5, "hsla(270, 80%, 60%, 0.25)");
      grad.addColorStop(1, "hsla(240, 50%, 10%, 0)");
      c.fillStyle = grad;
      c.beginPath();
      c.arc(cx, cy, r * 2.5, 0, Math.PI * 2);
      c.fill();

      // Barras radiales
      if (data) {
        const bars = data.length;
        for (let i = 0; i < bars; i++) {
          const v = data[i] / 255;
          const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
          const len = baseR * 0.5 + v * baseR * 1.8;
          const x1 = cx + Math.cos(angle) * r;
          const y1 = cy + Math.sin(angle) * r;
          const x2 = cx + Math.cos(angle) * (r + len);
          const y2 = cy + Math.sin(angle) * (r + len);
          const hue = 280 + v * 60;
          c.strokeStyle = `hsla(${hue}, 95%, ${50 + v * 30}%, ${0.5 + v * 0.5})`;
          c.lineWidth = 3 * dpr;
          c.lineCap = "round";
          c.beginPath();
          c.moveTo(x1, y1);
          c.lineTo(x2, y2);
          c.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [mediaEl]);

  // Resume audio context on user gesture (requerido por navegadores)
  useEffect(() => {
    const resume = () => ctxRef.current?.audioCtx.resume().catch(() => {});
    document.addEventListener("click", resume);
    document.addEventListener("touchstart", resume);
    return () => {
      document.removeEventListener("click", resume);
      document.removeEventListener("touchstart", resume);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
};
