import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, TrendingUp, Award } from "lucide-react";
import { formatNumber } from "@/lib/format";

interface Friend {
  id: number;
  username: string;
  firstName: string;
  earned: number;
}

interface DostlarProps {
  referralLink: string;
  invitedCount: number;
  activeCount: number;
  totalEarned: number;
  friends: Friend[];
}

export function Dostlar({
  referralLink,
  invitedCount,
  activeCount,
  totalEarned,
  friends,
}: DostlarProps) {
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Nusxalandi!",
      description: "Havola nusxalab olindi",
    });
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">Do'stlar</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Do'stlaringizni taklif qiling va daromad oling
        </p>

        <Card className="p-6 mb-6">
          <h3 className="font-bold mb-3">Sizning havolangiz</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border border-border"
              data-testid="input-referral-link"
            />
            <Button
              size="icon"
              onClick={handleCopyLink}
              data-testid="button-copy-referral"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Users className="w-6 h-6 text-primary mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Taklif qilingan</p>
              <p className="text-lg font-bold" data-testid="text-invited-count">
                {invitedCount}
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Faol</p>
              <p className="text-lg font-bold" data-testid="text-active-count">
                {activeCount}
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Award className="w-6 h-6 text-gold mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Daromad</p>
              <p className="text-sm font-bold text-gold" data-testid="text-referral-earned">
                {formatNumber(totalEarned)}
              </p>
            </div>
          </Card>
        </div>

        <div className="mb-3">
          <h3 className="font-bold text-sm mb-1">Do'stlar ro'yxati</h3>
          <p className="text-xs text-muted-foreground">
            Har yangi do'st uchun +1000 SherCoin
          </p>
          <p className="text-xs text-muted-foreground">
            Do'stning passiv daromadidan 5% ulush
          </p>
        </div>

        <div className="space-y-2">
          {friends.map((friend) => (
            <Card key={friend.id} className="p-3" data-testid={`card-friend-${friend.id}`}>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(friend.firstName || friend.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {friend.username || friend.firstName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Do'stingiz
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gold">
                    +{formatNumber(friend.earned)}
                  </p>
                  <p className="text-xs text-muted-foreground">SherCoin</p>
                </div>
              </div>
            </Card>
          ))}

          {friends.length === 0 && (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">
                Hali do'stlaringiz yo'q
              </p>
              <p className="text-sm text-muted-foreground">
                Havolani ulashing va daromad oling!
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
