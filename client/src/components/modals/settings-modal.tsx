import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sound";
import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [sound, setSound] = useState(isSoundEnabled());

  const handleSoundToggle = (checked: boolean) => {
    setSound(checked);
    setSoundEnabled(checked);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-settings">
        <DialogHeader>
          <DialogTitle>Sozlamalar</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Rejim</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex items-center gap-2"
                data-testid="button-theme-light"
              >
                <Sun className="w-4 h-4" />
                <span className="text-xs">Kunduzgi</span>
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2"
                data-testid="button-theme-dark"
              >
                <Moon className="w-4 h-4" />
                <span className="text-xs">Kechgi</span>
              </Button>
              <Button
                variant={theme === "auto" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("auto")}
                className="flex items-center gap-2"
                data-testid="button-theme-auto"
              >
                <Monitor className="w-4 h-4" />
                <span className="text-xs">Avto</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound">Ovoz effektlari</Label>
              <p className="text-sm text-muted-foreground">
                Bosilganda ovoz chiqarish
              </p>
            </div>
            <Switch
              id="sound"
              checked={sound}
              onCheckedChange={handleSoundToggle}
              data-testid="switch-sound"
            />
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-0.5">
              <Label>Til</Label>
              <p className="text-sm text-muted-foreground">O'zbek (default)</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
