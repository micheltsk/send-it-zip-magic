import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings2, RotateCcw } from "lucide-react";
import type { PlayerSettings } from "@/lib/types";
import { DEFAULT_PLAYER_SETTINGS } from "@/lib/types";

interface SettingsSheetProps {
  settings: PlayerSettings;
  onChange: (s: PlayerSettings) => void;
}

const ColorRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm">{label}</span>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-10 h-10 rounded-lg border border-border bg-transparent cursor-pointer"
    />
  </div>
);

const SizeRow = ({
  label,
  value,
  onChange,
  min = 12,
  max = 56,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <span className="text-xs text-muted-foreground font-mono">{value}px</span>
    </div>
    <Slider
      min={min}
      max={max}
      step={1}
      value={[value]}
      onValueChange={([v]) => onChange(v)}
    />
  </div>
);

export const SettingsSheet = ({ settings, onChange }: SettingsSheetProps) => {
  const set = <K extends keyof PlayerSettings>(k: K, v: PlayerSettings[K]) =>
    onChange({ ...settings, [k]: v });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" className="text-foreground/80">
          <Settings2 className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Personalizar reproductor</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6 pb-8">
          <section className="space-y-3">
            <h3 className="text-xs uppercase text-muted-foreground tracking-wider">Letra principal</h3>
            <ColorRow label="Color" value={settings.lyricColor} onChange={(v) => set("lyricColor", v)} />
            <SizeRow label="Tamaño" value={settings.lyricSize} onChange={(v) => set("lyricSize", v)} min={16} max={56} />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase text-muted-foreground tracking-wider">Pronunciación</h3>
              <Switch checked={settings.showPhonetic} onCheckedChange={(v) => set("showPhonetic", v)} />
            </div>
            <ColorRow label="Color" value={settings.phoneticColor} onChange={(v) => set("phoneticColor", v)} />
            <SizeRow label="Tamaño" value={settings.phoneticSize} onChange={(v) => set("phoneticSize", v)} min={10} max={32} />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase text-muted-foreground tracking-wider">Traducción</h3>
              <Switch checked={settings.showTranslation} onCheckedChange={(v) => set("showTranslation", v)} />
            </div>
            <ColorRow label="Color" value={settings.translationColor} onChange={(v) => set("translationColor", v)} />
            <SizeRow label="Tamaño" value={settings.translationSize} onChange={(v) => set("translationSize", v)} min={12} max={36} />
          </section>

          <Button variant="outline" className="w-full" onClick={() => onChange(DEFAULT_PLAYER_SETTINGS)}>
            <RotateCcw className="w-4 h-4 mr-2" /> Restablecer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
