import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatBalance } from "@/lib/format";
import { getTelegramUser } from "@/lib/telegram";

interface HeaderProps {
  balance: number;
  onProfileClick: () => void;
  onNotificationsClick: () => void;
  onSettingsClick: () => void;
}

export function Header({
  balance,
  onProfileClick,
  onNotificationsClick,
  onSettingsClick,
}: HeaderProps) {
  const user = getTelegramUser();

  const getInitials = () => {
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    return "S";
  };

  return (
    <header className="sticky top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b border-border z-40 pt-safe">
      <div className="flex items-center justify-between h-14 px-4">
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full w-10 h-10"
          onClick={onProfileClick}
          data-testid="button-profile"
        >
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-card-border">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
            <span className="text-xs font-bold text-secondary-foreground">
              S
            </span>
          </div>
          <span className="font-bold text-base tabular-nums text-card-foreground" data-testid="text-balance">
            {formatBalance(balance)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="w-9 h-9"
            onClick={onNotificationsClick}
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-9 h-9"
            onClick={onSettingsClick}
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
