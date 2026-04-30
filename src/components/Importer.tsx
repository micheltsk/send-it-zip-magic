import { useState, useRef } from "react";
import { Upload, Music, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { LANGUAGES } from "@/lib/languages";
import { processSong, type ProcessProgress } from "@/lib/processing";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const Importer = () => {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setBusy(true);
    setProgress({ stage: "init", percent: 0, message: "Preparando…" });

    try {
      const song = await processSong(file, targetLang, sourceLang, setProgress);
      toast.success("¡Canción procesada!");
      navigate(`/play/${song.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Error procesando");
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(null), 1500);
    }
  };

  return (
    <div className="space-y-6 px-5 pt-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-vibe bg-clip-text text-transparent">
          Inglés Cantando
        </h1>
        <p className="text-sm text-muted-foreground">
          Importa una canción y aprende con letras sincronizadas
        </p>
      </header>

      <Card className="p-5 bg-gradient-card border-border space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Idioma de la canción</label>
            <Select value={sourceLang} onValueChange={setSourceLang} disabled={busy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Traducir a</label>
            <Select value={targetLang} onValueChange={setTargetLang} disabled={busy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="audio/*,video/*"
          onChange={onFile}
          className="hidden"
        />
        <Button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          size="lg"
          className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
        >
          {busy ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Procesando…</>
          ) : (
            <><Upload className="w-5 h-5 mr-2" /> Elegir audio o video</>
          )}
        </Button>

        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Music className="w-3 h-3" /> MP3 / M4A / WAV</span>
          <span className="flex items-center gap-1"><Video className="w-3 h-3" /> MP4 / MOV</span>
        </div>
      </Card>

      {progress && (
        <Card className="p-4 bg-card border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Generando letra y traducción…</span>
            <span className="text-xs text-primary font-mono">{Math.round(progress.percent)}%</span>
          </div>
          <Progress value={progress.percent} className="h-2" />
          <p className="text-xs text-muted-foreground">{progress.message}</p>
        </Card>
      )}

      <Card className="p-4 bg-muted/30 border-border/50 text-xs text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">💡 Primera vez</p>
        <p>
          La primera canción descarga el modelo de IA (~75 MB) en tu teléfono.
          Después funciona <strong>100% offline</strong> y gratis. Las canciones
          de 3 min tardan 1-3 minutos en transcribirse.
        </p>
      </Card>
    </div>
  );
};
