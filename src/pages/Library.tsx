import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Music2, Trash2, Play, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listSongs, deleteSong } from "@/lib/db";
import type { Song } from "@/lib/types";
import { getLanguage } from "@/lib/languages";
import { toast } from "sonner";

const Library = () => {
  const [songs, setSongs] = useState<Song[] | null>(null);

  const load = () => listSongs().then(setSongs);
  useEffect(() => { load(); }, []);

  const onDelete = async (id: string) => {
    await deleteSong(id);
    toast.success("Canción eliminada");
    load();
  };

  return (
    <AppShell>
      <div className="px-5 pt-8 space-y-5">
        <header>
          <h1 className="text-2xl font-bold">Mi biblioteca</h1>
          <p className="text-sm text-muted-foreground">Tus canciones guardadas en este teléfono</p>
        </header>

        {!songs && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {songs && songs.length === 0 && (
          <Card className="p-6 text-center bg-gradient-card space-y-3">
            <Music2 className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aún no tienes canciones</p>
            <Button asChild className="bg-gradient-primary">
              <Link to="/">Importar la primera</Link>
            </Button>
          </Card>
        )}

        <div className="space-y-3">
          {songs?.map((s) => (
            <Card key={s.id} className="p-3 bg-gradient-card border-border flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-glow">
                <Music2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.title}</p>
                <p className="text-xs text-muted-foreground">
                  {getLanguage(s.sourceLang)?.flag} → {getLanguage(s.targetLang)?.flag}
                  {" · "}
                  {s.status === "ready" ? `${s.lines.length} líneas` : s.statusMessage || s.status}
                </p>
              </div>
              {s.status === "ready" && (
                <Button asChild size="icon" variant="ghost">
                  <Link to={`/play/${s.id}`}><Play className="w-5 h-5 text-primary" /></Link>
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={() => onDelete(s.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Library;
