import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play, Pause, SkipBack, SkipForward, ArrowLeft, Loader2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { LyricsView } from "@/components/LyricsView";
import { SettingsSheet } from "@/components/SettingsSheet";
import { getSong } from "@/lib/db";
import type { Song, PlayerSettings } from "@/lib/types";
import { DEFAULT_PLAYER_SETTINGS } from "@/lib/types";

const SETTINGS_KEY = "ic.player.settings";
const RATES = [0.5, 0.75, 1, 1.25, 1.5];

const formatTime = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [mediaEl, setMediaEl] = useState<HTMLMediaElement | null>(null);
  const [settings, setSettings] = useState<PlayerSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? { ...DEFAULT_PLAYER_SETTINGS, ...JSON.parse(raw) } : DEFAULT_PLAYER_SETTINGS;
    } catch {
      return DEFAULT_PLAYER_SETTINGS;
    }
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!id) return;
    getSong(id).then((s) => {
      if (!s) {
        navigate("/library");
        return;
      }
      setSong(s);
      const url = URL.createObjectURL(s.mediaBlob);
      setMediaUrl(url);
      return () => URL.revokeObjectURL(url);
    });
  }, [id, navigate]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const el = song?.mediaType === "video" ? videoRef.current : audioRef.current;
    setMediaEl(el);
    if (el) el.playbackRate = rate;
  }, [song, mediaUrl, rate]);

  const togglePlay = () => {
    if (!mediaEl) return;
    if (mediaEl.paused) mediaEl.play();
    else mediaEl.pause();
  };

  const seek = (t: number) => {
    if (!mediaEl) return;
    mediaEl.currentTime = Math.max(0, Math.min(duration, t));
  };

  const skip = (delta: number) => seek(time + delta);

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const isVideo = song.mediaType === "video";

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* Background visualizer (audio only) */}
      {!isVideo && (
        <AudioVisualizer mediaEl={mediaEl} className="absolute inset-0 w-full h-full opacity-70" />
      )}

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between p-3 safe-top bg-background/40 backdrop-blur-md">
        <Button size="icon" variant="ghost" onClick={() => navigate("/library")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-sm font-semibold truncate max-w-[60%]">{song.title}</h2>
        <SettingsSheet settings={settings} onChange={setSettings} />
      </header>

      {/* Video preview */}
      {isVideo && (
        <div className="relative z-10 bg-black aspect-video flex items-center justify-center">
          <video
            ref={videoRef}
            src={mediaUrl ?? undefined}
            className="w-full h-full object-contain"
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => setTime((e.target as HTMLVideoElement).currentTime)}
            onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
          />
        </div>
      )}

      {!isVideo && (
        <audio
          ref={audioRef}
          src={mediaUrl ?? undefined}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime((e.target as HTMLAudioElement).currentTime)}
          onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        />
      )}

      {/* Lyrics */}
      <div className="relative z-10 flex-1 min-h-0">
        <LyricsView
          lines={song.lines}
          currentTime={time}
          settings={settings}
          onSeek={seek}
        />
      </div>

      {/* Bottom controls */}
      <footer className="relative z-10 bg-background/70 backdrop-blur-xl border-t border-border p-4 space-y-3 safe-bottom">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="w-10">{formatTime(time)}</span>
          <Slider
            min={0}
            max={duration || 1}
            step={0.1}
            value={[time]}
            onValueChange={([v]) => seek(v)}
            className="flex-1"
          />
          <span className="w-10 text-right">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button size="icon" variant="ghost" onClick={() => skip(-5)}>
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
          >
            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => skip(5)}>
            <SkipForward className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-1 text-xs">
                <Gauge className="w-4 h-4" /> {rate}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {RATES.map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRate(r)}>
                  {r}x {r === 1 && "(normal)"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </footer>
    </div>
  );
};

export default Player;
