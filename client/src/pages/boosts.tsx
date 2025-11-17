import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Infinity, TrendingUp, MousePointer } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { useEffect, useState } from "react";

interface Boost {
  id: number;
  code: string;
  name: string;
  description: string;
  durationSeconds: number;
  price: number;
  activeUntil?: string;
}

interface BoostsProps {
  boosts: Boost[];
  onActivateBoost: (boostId: number) => void;
  balance: number;
}

export function Boosts({ boosts, onActivateBoost, balance }: BoostsProps) {
  const [timeRemaining, setTimeRemaining] = useState<Record<number, number>>(
    {}
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newRemaining: Record<number, number> = {};
      boosts.forEach((boost) => {
        if (boost.activeUntil) {
          const remaining = Math.max(
            0,
            new Date(boost.activeUntil).getTime() - Date.now()
          );
          newRemaining[boost.id] = Math.floor(remaining / 1000);
        }
      });
      setTimeRemaining(newRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [boosts]);

  const getBoostIcon = (code: string) => {
    switch (code) {
      case "DOUBLE_TAP":
        return <MousePointer className="w-8 h-8" />;
      case "UNLIMITED_ENERGY":
        return <Infinity className="w-8 h-8" />;
      case "DOUBLE_HOURLY":
        return <TrendingUp className="w-8 h-8" />;
      case "AUTO_TAP":
        return <Zap className="w-8 h-8" />;
      default:
        return <Zap className="w-8 h-8" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">SherBoost</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Daromadingizni oshirish uchun boostlarni faollashtiring
        </p>

        <div className="grid grid-cols-2 gap-3">
          {boosts.map((boost) => {
            const isActive = timeRemaining[boost.id] > 0;
            const canAfford = balance >= boost.price;

            return (
              <Card
                key={boost.id}
                className="p-4"
                data-testid={`card-boost-${boost.id}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                    {getBoostIcon(boost.code)}
                  </div>

                  <h3 className="font-bold text-sm mb-1">{boost.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2 min-h-[2.5rem]">
                    {boost.description}
                  </p>

                  {isActive ? (
                    <>
                      <Badge variant="default" className="mb-2">
                        Faol
                      </Badge>
                      <p className="text-sm font-bold text-primary">
                        {formatTime(timeRemaining[boost.id])}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-accent mb-2">
                        {boost.durationSeconds / 60} daqiqa
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => onActivateBoost(boost.id)}
                        disabled={!canAfford}
                        data-testid={`button-activate-boost-${boost.id}`}
                      >
                        <span className="text-xs">
                          {formatNumber(boost.price)} SherCoin
                        </span>
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {boosts.length === 0 && (
          <Card className="p-8 text-center">
            <Zap className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Boostlar topilmadi</p>
          </Card>
        )}
      </div>
    </div>
  );
}
