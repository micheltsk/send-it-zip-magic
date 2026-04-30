import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Smartphone, Download, Music, Globe2, Zap, Hand } from "lucide-react";

const Help = () => (
  <AppShell>
    <div className="px-5 pt-8 space-y-5 pb-6">
      <header>
        <h1 className="text-2xl font-bold">Cómo usar la app</h1>
        <p className="text-sm text-muted-foreground">Aprende idiomas cantando, paso a paso</p>
      </header>

      {[
        {
          icon: Music,
          title: "1. Importa una canción",
          body: "Toca «Elegir audio o video» y selecciona un archivo MP3, M4A, WAV, MP4 o MOV de tu teléfono.",
        },
        {
          icon: Globe2,
          title: "2. Elige los idiomas",
          body: "El idioma de la canción (por ejemplo, inglés) y el idioma al que quieres traducir (español, francés…).",
        },
        {
          icon: Zap,
          title: "3. Espera el procesado",
          body: "La primera vez la app descarga el modelo de IA (~75 MB). Después, transcribir una canción de 3 min tarda 1-3 minutos. Todo ocurre en tu teléfono — sin internet tras la primera carga.",
        },
        {
          icon: Hand,
          title: "4. Reproductor karaoke",
          body: "Toca cualquier línea para saltar a ese momento. Cambia velocidad (0.5x-1.5x) sin alterar el tono. Personaliza color y tamaño de la letra, fonética y traducción desde el icono ⚙️.",
        },
        {
          icon: Download,
          title: "5. Guarda y reproduce offline",
          body: "Cada canción procesada se guarda en tu teléfono. Aparecen en «Biblioteca» y funcionan sin internet.",
        },
        {
          icon: Smartphone,
          title: "6. Instalar como app",
          body: "En Chrome Android: menú ⋮ → «Instalar app» o «Añadir a pantalla de inicio». En iPhone Safari: compartir → «Añadir a inicio».",
        },
      ].map(({ icon: Icon, title, body }) => (
        <Card key={title} className="p-4 bg-gradient-card border-border">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{body}</p>
            </div>
          </div>
        </Card>
      ))}

      <Card className="p-4 bg-muted/30 border-border/50 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">🔒 100% privado</p>
        <p>Tus archivos no salen del teléfono. La transcripción ocurre localmente. Solo la traducción usa servidores públicos gratuitos (LibreTranslate).</p>
      </Card>
    </div>
  </AppShell>
);

export default Help;
