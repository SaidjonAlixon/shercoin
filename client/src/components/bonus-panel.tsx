import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Gift, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface BonusPanelProps {
  dailyLoginStreak: number;
  onDailyLoginClick: () => void;
  onPromoSubmit: (code: string) => void;
  dailyMission?: {
    title: string;
    progress: number;
    total: number;
    reward: number;
  };
}

export function BonusPanel({
  dailyLoginStreak,
  onDailyLoginClick,
  onPromoSubmit,
  dailyMission,
}: BonusPanelProps) {
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  const handlePromoSubmit = () => {
    if (promoCode.trim()) {
      onPromoSubmit(promoCode.trim());
      setPromoCode("");
      setPromoOpen(false);
    }
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 px-4 no-scrollbar snap-x snap-mandatory">
        <Card
          className="flex-shrink-0 w-72 p-4 cursor-pointer hover-elevate active-elevate-2 snap-start"
          onClick={onDailyLoginClick}
          data-testid="card-daily-login"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm mb-0.5">Kundalik kirish</h3>
              <p className="text-xs text-muted-foreground">
                {dailyLoginStreak} kunlik zanjir
              </p>
              <p className="text-xs text-gold font-bold mt-1">
                +{dailyLoginStreak * 100} SherCoin
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="flex-shrink-0 w-72 p-4 cursor-pointer hover-elevate active-elevate-2 snap-start"
          onClick={() => setPromoOpen(true)}
          data-testid="card-promo-code"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm mb-0.5">Omad kodi</h3>
              <p className="text-xs text-muted-foreground">
                Promo-kod kiriting
              </p>
              <p className="text-xs text-accent font-bold mt-1">Bonus olish</p>
            </div>
          </div>
        </Card>

        {dailyMission && (
          <Card className="flex-shrink-0 w-72 p-4 snap-start" data-testid="card-daily-mission">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm mb-0.5">Kundalik vazifa</h3>
                <p className="text-xs text-muted-foreground">
                  {dailyMission.title}
                </p>
                <p className="text-xs text-gold font-bold mt-1">
                  {dailyMission.progress} / {dailyMission.total}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={promoOpen} onOpenChange={setPromoOpen}>
        <DialogContent data-testid="modal-promo-code">
          <DialogHeader>
            <DialogTitle>Promo-kod kiriting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="promo-code">Kod</Label>
              <Input
                id="promo-code"
                placeholder="SHERCOIN2024"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                data-testid="input-promo-code"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handlePromoSubmit}
              disabled={!promoCode.trim()}
              data-testid="button-submit-promo"
            >
              Tekshirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
