import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { initTelegramWebApp, getTelegramInitData } from "@/lib/telegram";
import { useEffect, useState } from "react";
import { apiRequest, setUserId, getUserId } from "@/lib/queryClient";

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProfileModal } from "@/components/modals/profile-modal";
import { SettingsModal } from "@/components/modals/settings-modal";

import { Arena } from "@/pages/arena";
import { Topshiriqlar } from "@/pages/topshiriqlar";
import { SherMaktab } from "@/pages/shermaktab";
import { Dostlar } from "@/pages/dostlar";
import { Xazina } from "@/pages/xazina";
import { Boosts } from "@/pages/boosts";
import NotFound from "@/pages/not-found";

function AppContent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: userData, refetch: refetchUser } = useQuery<any>({
    queryKey: ["/api/user/profile"],
    enabled: isAuthenticated,
  });

  const { data: boostsData } = useQuery<any>({
    queryKey: ["/api/boosts"],
    enabled: isAuthenticated,
  });

  const { data: tasksData } = useQuery<any>({
    queryKey: ["/api/tasks"],
    enabled: isAuthenticated,
  });

  const { data: articlesData } = useQuery<any>({
    queryKey: ["/api/articles"],
    enabled: isAuthenticated,
  });

  const { data: referralsData } = useQuery<any>({
    queryKey: ["/api/referrals"],
    enabled: isAuthenticated,
  });

  const { data: dailyLoginData } = useQuery<any>({
    queryKey: ["/api/daily-login"],
    enabled: isAuthenticated,
  });

  const tapMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/tap", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Xato",
        description: error.message || "Energiya tugagan",
        variant: "destructive",
      });
    },
  });

  const activateBoostMutation = useMutation({
    mutationFn: (boostId: number) =>
      apiRequest("POST", "/api/boosts/activate", { boostId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boosts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Muvaffaqiyatli!",
        description: "Boost faollashtirildi",
      });
    },
    onError: () => {
      toast({
        title: "Xato",
        description: "Boost faollashtib bo'lmadi",
        variant: "destructive",
      });
    },
  });

  const taskStartMutation = useMutation({
    mutationFn: (taskId: number) =>
      apiRequest("POST", "/api/tasks/start", { taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const taskVerifyMutation = useMutation({
    mutationFn: (taskId: number) =>
      apiRequest("POST", "/api/tasks/verify", { taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Tekshirilmoqda",
        description: "Topshiriq tekshirildi, mukofotni oling",
      });
    },
  });

  const taskClaimMutation = useMutation({
    mutationFn: (taskId: number) =>
      apiRequest("POST", "/api/tasks/claim", { taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Mukofot olindi!",
        description: "SherCoin balansingizga qo'shildi",
      });
    },
  });

  const articleCompleteMutation = useMutation({
    mutationFn: (articleId: number) =>
      apiRequest("POST", "/api/articles/complete", { articleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Muvaffaqiyatli!",
        description: "Mukofot olindi",
      });
    },
  });

  const promoClaimMutation = useMutation({
    mutationFn: (code: string) =>
      apiRequest("POST", "/api/promo/claim", { code }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Muvaffaqiyatli!",
        description: `+${data.reward} SherCoin olindi`,
      });
    },
    onError: () => {
      toast({
        title: "Xato",
        description: "Kod noto'g'ri yoki ishlatilgan",
        variant: "destructive",
      });
    },
  });

  const dailyLoginClaimMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/daily-login/claim", {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-login"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Kundalik bonus!",
        description: `+${data.reward} SherCoin olindi`,
      });
    },
  });

  useEffect(() => {
    // Telegram WebApp'ni initialize qilish (ixtiyoriy)
    try {
      initTelegramWebApp();
    } catch (e) {
      // Telegram bo'lmasa ham ishlaydi
    }

    // Agar localStorage'da userId bo'lsa, ishlatamiz
    const existingUserId = getUserId();
    if (existingUserId) {
      setIsAuthenticated(true);
      return;
    }

    // Yangi user yaratish - bir necha marta urinib ko'ramiz
    const initData = getTelegramInitData();
    
    const tryAuth = (attempt = 1) => {
      apiRequest("POST", "/api/auth/telegram", {
        initData: initData || "",
      })
        .then((data: any) => {
          if (data?.userId) {
            setUserId(data.userId);
            setIsAuthenticated(true);
          } else {
            // Agar userId bo'lmasa, random yaratamiz
            const randomId = Math.floor(Math.random() * 1000000) + 100000;
            setUserId(randomId);
            setIsAuthenticated(true);
          }
        })
        .catch((error: any) => {
          console.error("Auth failed:", error);
          if (attempt < 3) {
            // 3 marta urinib ko'ramiz
            setTimeout(() => tryAuth(attempt + 1), 1000);
          } else {
            // Oxirgi urinish - random userId yaratamiz
            const randomId = Math.floor(Math.random() * 1000000) + 100000;
            setUserId(randomId);
            setIsAuthenticated(true);
          }
        });
    };

    tryAuth();
  }, []);

  useEffect(() => {
    if (!userData?.balance) return;

    const interval = setInterval(() => {
      refetchUser();
    }, 3000);

    return () => clearInterval(interval);
  }, [userData, refetchUser]);

  if (!isAuthenticated || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const balance = userData.balance?.balance || 0;
  const hourlyIncome = userData.balance?.hourlyIncome || 0;
  const energy = userData.balance?.energy || 1000;
  const maxEnergy = userData.balance?.maxEnergy || 1000;
  const totalTaps = userData.balance?.totalTaps || 0;
  const level = userData.balance?.level || 1;
  const xp = userData.balance?.xp || 0;

  const botUsername = "SherCoinBot";
  const referralLink = `https://t.me/${botUsername}?start=${userData.user?.id || ""}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      <Header
        balance={balance}
        onProfileClick={() => setProfileOpen(true)}
        onNotificationsClick={() =>
          toast({ title: "Bildirishnomalar", description: "Yangi bildirishnomalar yo'q" })
        }
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <Switch>
        <Route path="/">
          <Arena
            balance={balance}
            hourlyIncome={hourlyIncome}
            energy={energy}
            maxEnergy={maxEnergy}
            onTap={() => tapMutation.mutate()}
            onBoostsClick={() => setLocation("/boosts")}
            onFriendsClick={() => setLocation("/dostlar")}
            onDailyLoginClick={() => dailyLoginClaimMutation.mutate()}
            onPromoSubmit={(code) => promoClaimMutation.mutate(code)}
            dailyLoginStreak={dailyLoginData?.streak || 1}
          />
        </Route>

        <Route path="/topshiriqlar">
          <Topshiriqlar
            tasks={tasksData?.tasks || []}
            onTaskStart={(id) => taskStartMutation.mutate(id)}
            onTaskVerify={(id) => taskVerifyMutation.mutate(id)}
            onTaskClaim={(id) => taskClaimMutation.mutate(id)}
          />
        </Route>

        <Route path="/shermaktab">
          <SherMaktab
            articles={articlesData?.articles || []}
            onArticleComplete={(id) => articleCompleteMutation.mutate(id)}
          />
        </Route>

        <Route path="/dostlar">
          <Dostlar
            referralLink={referralLink}
            invitedCount={referralsData?.invitedCount || 0}
            activeCount={referralsData?.activeCount || 0}
            totalEarned={referralsData?.totalEarned || 0}
            friends={referralsData?.friends || []}
          />
        </Route>

        <Route path="/xazina">
          <Xazina
            balance={balance}
            airdropBalance={0}
            isEligibleForAirdrop={balance >= 10000 && (referralsData?.activeCount || 0) >= 3}
            minBalanceRequired={10000}
            minFriendsRequired={3}
            currentFriendsCount={referralsData?.activeCount || 0}
          />
        </Route>

        <Route path="/boosts">
          <Boosts
            boosts={boostsData?.boosts || []}
            onActivateBoost={(id) => activateBoostMutation.mutate(id)}
            balance={balance}
          />
        </Route>

        <Route component={NotFound} />
      </Switch>

      <BottomNav />

      <ProfileModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        totalTaps={totalTaps}
        level={level}
        xp={xp}
        createdAt={userData.user?.createdAt || new Date().toISOString()}
      />

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="auto">
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
