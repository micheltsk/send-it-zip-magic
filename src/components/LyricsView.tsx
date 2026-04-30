import { useEffect, useRef } from "react";
import type { LyricLine, PlayerSettings } from "@/lib/types";

interface LyricsViewProps {
  lines: LyricLine[];
  currentTime: number;
  settings: PlayerSettings;
  onSeek: (time: number) => void;
}

const findActiveIndex = (lines: LyricLine[], t: number): number => {
  // Linear scan; lines are short enough
  for (let i = lines.length - 1; i >= 0; i--) {
    if (t >= lines[i].start) return i;
  }
  return -1;
};

export const LyricsView = ({ lines, currentTime, settings, onSeek }: LyricsViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIdx = findActiveIndex(lines, currentTime);
  const lastIdxRef = useRef(-1);

  useEffect(() => {
    if (activeIdx === lastIdxRef.current || activeIdx < 0) return;
    lastIdxRef.current = activeIdx;
    const el = containerRef.current?.querySelector<HTMLElement>(`[data-line="${activeIdx}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIdx]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto h-full px-5 py-[40vh] space-y-6 scroll-smooth"
    >
      {lines.map((line, i) => {
        const isActive = i === activeIdx;
        const isPast = i < activeIdx;
        return (
          <div
            key={i}
            data-line={i}
            data-active={isActive}
            onClick={() => onSeek(line.start)}
            className="lyric-line text-center"
            style={{ opacity: isActive ? 1 : isPast ? 0.35 : 0.55 }}
          >
            <p
              style={{
                color: isActive ? undefined : settings.lyricColor,
                fontSize: settings.lyricSize,
                fontWeight: 700,
                lineHeight: 1.2,
                background: isActive
                  ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))"
                  : undefined,
                WebkitBackgroundClip: isActive ? "text" : undefined,
                WebkitTextFillColor: isActive ? "transparent" : undefined,
              }}
            >
              {line.text}
            </p>
            {settings.showPhonetic && line.phonetic && (
              <p
                style={{
                  color: settings.phoneticColor,
                  fontSize: settings.phoneticSize,
                  fontStyle: "italic",
                  marginTop: 4,
                }}
              >
                /{line.phonetic}/
              </p>
            )}
            {settings.showTranslation && line.translation && (
              <p
                style={{
                  color: settings.translationColor,
                  fontSize: settings.translationSize,
                  marginTop: 6,
                }}
              >
                {line.translation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
