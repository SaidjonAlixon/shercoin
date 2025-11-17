import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, Gift, CheckCircle2, XCircle } from "lucide-react";
import { formatBalance } from "@/lib/format";

interface XazinaProps {
  balance: number;
  airdropBalance: number;
  isEligibleForAirdrop: boolean;
  minBalanceRequired: number;
  minFriendsRequired: number;
  currentFriendsCount: number;
}

export function Xazina({
  balance,
  airdropBalance,
  isEligibleForAirdrop,
  minBalanceRequired,
  minFriendsRequired,
  currentFriendsCount,
}: XazinaProps) {
  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Xazina</h1>

        <Tabs defaultValue="wallet">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="wallet" data-testid="tab-wallet">
              Hamyon
            </TabsTrigger>
            <TabsTrigger value="airdrop" data-testid="tab-airdrop">
              Airdrop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Umumiy balans</p>
                  <p className="text-2xl font-bold" data-testid="text-total-balance">
                    {formatBalance(balance)}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    O'yindagi balans
                  </span>
                  <span className="font-medium" data-testid="text-game-balance">
                    {formatBalance(balance - airdropBalance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Airdropga ajratilgan
                  </span>
                  <span className="font-medium text-gold" data-testid="text-airdrop-balance">
                    {formatBalance(airdropBalance)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-muted/30">
              <p className="text-sm text-muted-foreground text-center">
                Kelajakda USDT / TON ga konvertatsiya qilish imkoniyati
                qo'shiladi
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="airdrop" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Airdrop holati
                  </p>
                  {isEligibleForAirdrop ? (
                    <Badge variant="default" className="mt-1">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Qatnashyapsiz
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-1">
                      <XCircle className="w-3 h-3 mr-1" />
                      Talabga javob bermaysiz
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-bold text-sm">Minimal shartlar:</h3>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Minimal balans</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {formatBalance(minBalanceRequired)}
                    </span>
                    {balance >= minBalanceRequired ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Minimal do'stlar</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {currentFriendsCount} / {minFriendsRequired}
                    </span>
                    {currentFriendsCount >= minFriendsRequired ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-accent/5 border-accent/20">
              <p className="text-sm text-center">
                Airdrop kampaniyasi tafsilotlari tez orada e'lon qilinadi.
                Shartlarni bajarib, mukofotga tayyorlaning!
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
