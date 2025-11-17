import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BonusPanel } from "@/components/bonus-panel";
import { formatBalance } from "@/lib/format";
import { playTapSound } from "@/lib/sound";
import { triggerHaptic } from "@/lib/telegram";
import { Zap, Users, TrendingUp } from "lucide-react";
import coinImage from "@assets/generated_images/shercoin_tanga.png";

interface FloatingCoin {
  id: number;
  x: number;
  y: number;
  amount: number;
}

interface ArenaProps {
  balance: number;
  hourlyIncome: number;
  energy: number;
  maxEnergy: number;
  onTap: () => void;
  onBoostsClick: () => void;
  onFriendsClick: () => void;
  onDailyLoginClick: () => void;
  onPromoSubmit: (code: string) => void;
  dailyLoginStreak: number;
}

export function Arena({
  balance,
  hourlyIncome,
  energy,
  maxEnergy,
  onTap,
  onBoostsClick,
  onFriendsClick,
  onDailyLoginClick,
  onPromoSubmit,
  dailyLoginStreak,
}: ArenaProps) {
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoin[]>([]);
  const [coinScale, setCoinScale] = useState(1);

  const energyPercentage = (energy / maxEnergy) * 100;

  const handleCoinTap = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (energy <= 0) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newCoin: FloatingCoin = {
        id: Date.now(),
        x,
        y,
        amount: 1,
      };

      setFloatingCoins((prev) => [...prev, newCoin]);
      setTimeout(() => {
        setFloatingCoins((prev) => prev.filter((c) => c.id !== newCoin.id));
      }, 1000);

      setCoinScale(1.1);
      setTimeout(() => setCoinScale(1), 100);

      playTapSound();
      triggerHaptic("light");

      onTap();
    },
    [energy, onTap]
  );

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <BonusPanel
        dailyLoginStreak={dailyLoginStreak}
        onDailyLoginClick={onDailyLoginClick}
        onPromoSubmit={onPromoSubmit}
      />

      <div className="flex-1 flex flex-col px-4 pt-6 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                <span className="text-xs font-bold text-secondary-foreground">
                  S
                </span>
              </div>
              <span className="text-3xl font-bold tabular-nums text-card-foreground">
                {formatBalance(balance)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +{formatBalance(hourlyIncome)} / soat
            </p>
          </div>
        </Card>

        <div className="flex-1 flex items-center justify-center relative">
          <div
            className="relative w-[280px] h-[280px] select-none"
            style={{
              transform: `scale(${coinScale})`,
              transition: "transform 0.1s ease-out",
            }}
            data-testid="button-tap-coin"
          >
            <img
              src={coinImage}
              alt="SherCoin"
              className="w-full h-full object-contain drop-shadow-2xl cursor-pointer"
              style={{
                filter: "drop-shadow(0 8px 25px rgba(0,0,0,0.35))",
              }}
              draggable={false}
              onClick={handleCoinTap}
            />

            {floatingCoins.map((coin) => (
              <div
                key={coin.id}
                className="absolute pointer-events-none text-2xl font-bold text-gold animate-float-up"
                style={{
                  left: coin.x,
                  top: coin.y,
                  animation: "floatUp 1s ease-out forwards",
                }}
              >
                +{coin.amount}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Zap className="w-4 h-4" />
              Energiya:
            </span>
            <span className="font-bold tabular-nums" data-testid="text-energy">
              {energy} / {maxEnergy}
            </span>
          </div>
          <Progress value={energyPercentage} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Har 3 sekundda +5 ga to'ldiriladi
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onBoostsClick}
            data-testid="button-boosts"
          >
            <Zap className="w-4 h-4" />
            SherBoost
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onFriendsClick}
            data-testid="button-friends-shortcut"
          >
            <Users className="w-4 h-4" />
            SherDo'stlar
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-80px);
          }
        }
      `}</style>
    </div>
  );
}
