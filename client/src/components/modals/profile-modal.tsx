import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { getTelegramUser } from "@/lib/telegram";
import { formatBalance } from "@/lib/format";
import { Calendar, Hash, Zap, TrendingUp } from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalTaps: number;
  level: number;
  xp: number;
  createdAt: string;
}

export function ProfileModal({
  open,
  onOpenChange,
  totalTaps,
  level,
  xp,
  createdAt,
}: ProfileModalProps) {
  const user = getTelegramUser();

  const getInitials = () => {
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    return "S";
  };

  const xpForNextLevel = level * 1000;
  const xpProgress = (xp / xpForNextLevel) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-profile">
        <DialogHeader>
          <DialogTitle>Profil</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h3 className="text-xl font-bold" data-testid="text-username">
              {user?.username || user?.first_name || "SherCoin User"}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1" data-testid="text-userid">
              <Hash className="w-3 h-3" />
              {user?.id || "000000"}
            </p>
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  Ro'yxatdan o'tgan
                </p>
                <p className="text-sm font-medium" data-testid="text-registration-date">
                  {new Date(createdAt).toLocaleDateString("uz-UZ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Umumiy bosishlar</p>
                <p className="text-sm font-medium" data-testid="text-total-taps">
                  {formatBalance(totalTaps)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  Daraja va tajriba
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold" data-testid="text-level">
                    Daraja {level}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {xp} / {xpForNextLevel} XP
                  </span>
                </div>
                <Progress value={xpProgress} className="mt-2 h-2" />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
