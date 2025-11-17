import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyTelegramWebAppData } from "./lib/telegram";
import { getDb } from "./db";
import { eq } from "drizzle-orm";

// SQLite yoki PostgreSQL uchun mos schema import - lazy initialization
let schemaModule: any = null;
let schemaInitialized = false;

async function getSchema() {
  if (schemaInitialized && schemaModule) {
    return schemaModule;
  }
  
  const useSQLite = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:') || process.env.DATABASE_URL.endsWith('.db');
  schemaModule = useSQLite 
    ? await import('@shared/schema-sqlite')
    : await import('@shared/schema');
  schemaInitialized = true;
  return schemaModule;
}

async function getTables() {
  const schema = await getSchema();
  return {
    users: schema.users,
    balances: schema.balances,
    tasks: schema.tasks,
    articles: schema.articles,
    boosts: schema.boosts,
  };
}

const ENERGY_REGEN_RATE = 5;
const ENERGY_REGEN_INTERVAL = 3;
const MAX_TAPS_PER_SECOND = 20;
const TAP_COOLDOWN_MS = 1000;

const userTapCounts = new Map<number, { count: number; resetTime: number }>();

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      console.log("POST /api/auth/telegram - Request received");
      const { initData, referrerId } = req.body;

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const isDevelopment = process.env.NODE_ENV === "development";
      const allowDevAuth = process.env.ALLOW_DEV_AUTH === "true";

      console.log("Auth config:", { 
        hasBotToken: !!botToken, 
        isDevelopment, 
        allowDevAuth,
        hasInitData: !!initData 
      });

      if (!botToken && !isDevelopment && !allowDevAuth) {
        console.error("Bot token not configured and dev auth not allowed");
        return res.status(500).json({ error: "Bot token not configured" });
      }

      let telegramId: number;
      let username: string | null;
      let firstName: string | null;
      let languageCode: string;

      if (!initData || initData === "") {
        // Development yoki test rejimida (Vercel'da ham test qilish uchun)
        if (isDevelopment || allowDevAuth) {
          console.log("Using dev auth mode");
          telegramId = 999999999;
          username = "devuser";
          firstName = "Dev";
          languageCode = "uz";
        } else {
          console.error("Missing initData and dev auth not allowed");
          return res.status(401).json({ 
            error: "Missing Telegram authentication data",
            message: "Telegram WebApp initData kerak. Agar test qilmoqchi bo'lsangiz, ALLOW_DEV_AUTH=true qo'shing."
          });
        }
      } else {
        if (!botToken) {
          return res.status(500).json({ error: "Bot token not configured" });
        }

        if (!verifyTelegramWebAppData(initData, botToken)) {
          return res.status(401).json({ error: "Invalid Telegram data" });
        }

        const params = new URLSearchParams(initData);
        const userDataStr = params.get("user");
        if (!userDataStr) {
          return res.status(401).json({ error: "Invalid user data" });
        }

        const userData = JSON.parse(userDataStr);
        telegramId = userData.id;
        username = userData.username || null;
        firstName = userData.first_name || null;
        languageCode = userData.language_code || "uz";
      }

      let user = await storage.getUserByTelegramId(telegramId);

      if (!user) {
        user = await storage.createUser({
          telegramId,
          username: username || null,
          firstName: firstName || null,
          language: languageCode || "uz",
          referrerId: referrerId || null,
          theme: "auto",
        });

        await storage.createBalance({
          userId: user.id,
          balance: 0,
          hourlyIncome: 0,
          totalTaps: 0,
          energy: 1000,
          maxEnergy: 1000,
          level: 1,
          xp: 0,
        });

        if (referrerId) {
          await storage.createReferral(referrerId, user.id);
          await storage.updateBalance(referrerId, 1000);
          await storage.createTransaction(referrerId, "referral", 1000, { friendId: user.id });
        }
      } else {
        await storage.updateUserLogin(user.id);
      }

      req.session.userId = user.id;

      res.json({ success: true, userId: user.id });
    } catch (error: any) {
      console.error("❌ Auth error:", error);
      console.error("Auth error stack:", error?.stack);
      console.error("Auth error name:", error?.name);
      console.error("Auth error message:", error?.message);
      
      // Agar response yuborilmagan bo'lsa, yuboramiz
      if (!res.headersSent) {
        res.status(500).json({ 
          error: "Authentication failed",
          message: error?.message || "Autentifikatsiya xatosi yuz berdi"
        });
      }
    }
  });

  app.get("/api/user/profile", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let balance = await storage.getBalance(userId);
      if (!balance) {
        balance = await storage.createBalance({
          userId,
          balance: 0,
          hourlyIncome: 0,
          totalTaps: 0,
          energy: 1000,
          maxEnergy: 1000,
          level: 1,
          xp: 0,
        });
      }

      const now = Date.now();
      const lastUpdate = new Date(balance.energyUpdatedAt).getTime();
      const timeDiff = Math.floor((now - lastUpdate) / 1000);
      const energyToAdd = Math.floor(timeDiff / ENERGY_REGEN_INTERVAL) * ENERGY_REGEN_RATE;
      const currentEnergy = Math.min(balance.energy + energyToAdd, balance.maxEnergy);

      if (energyToAdd > 0) {
        await storage.updateEnergy(userId, currentEnergy);
        balance.energy = currentEnergy;
      }

      res.json({ user, balance });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/tap", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const now = Date.now();
      const userTapData = userTapCounts.get(userId);

      if (userTapData) {
        if (now < userTapData.resetTime) {
          userTapData.count++;
          if (userTapData.count > MAX_TAPS_PER_SECOND) {
            return res.status(429).json({ error: "Too many taps. Slow down!" });
          }
        } else {
          userTapCounts.set(userId, { count: 1, resetTime: now + TAP_COOLDOWN_MS });
        }
      } else {
        userTapCounts.set(userId, { count: 1, resetTime: now + TAP_COOLDOWN_MS });
      }

      const balance = await storage.getBalance(userId);
      if (!balance) {
        return res.status(404).json({ error: "Balance not found" });
      }
      
      const currentEnergy = Number(balance.energy || 0);
      if (currentEnergy < 1) {
        return res.status(400).json({ error: "Not enough energy" });
      }

      const activeBoosts = await storage.getUserActiveBoosts(userId);
      let tapMultiplier = 1;
      for (const boost of activeBoosts) {
        const tables = await getTables();
        const db = await getDb();
        const boostData = await db.select().from(tables.boosts).where(eq(tables.boosts.id, boost.boostId)).limit(1);
        if (boostData[0]?.code === "DOUBLE_TAP") {
          tapMultiplier = 2;
        }
      }

      const coinsToAdd = tapMultiplier;
      await storage.updateBalance(userId, coinsToAdd);
      await storage.updateEnergy(userId, currentEnergy - 1);
      await storage.incrementTaps(userId, 1);
      await storage.addXP(userId, 1);
      await storage.createTransaction(userId, "tap", coinsToAdd);

      res.json({ success: true, coinsAdded: coinsToAdd });
    } catch (error: any) {
      console.error("Tap error:", error);
      console.error("Error stack:", error?.stack);
      console.error("Error message:", error?.message);
      res.status(500).json({ error: "Failed to process tap", details: error?.message });
    }
  });

  app.get("/api/boosts", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const allBoosts = await storage.getBoosts();
      const activeBoosts = await storage.getUserActiveBoosts(userId);

      const boostsWithStatus = allBoosts.map((boost) => {
        const active = activeBoosts.find((ab) => ab.boostId === boost.id);
        let activeUntil = null;
        if (active) {
          // SQLite uchun timestamp Date object yoki number bo'lishi mumkin
          if (active.expiresAt instanceof Date) {
            activeUntil = active.expiresAt.toISOString();
          } else {
            activeUntil = new Date(active.expiresAt).toISOString();
          }
        }
        return {
          ...boost,
          activeUntil,
        };
      });

      res.json({ boosts: boostsWithStatus });
    } catch (error: any) {
      console.error("Boosts error:", error);
      console.error("Error stack:", error?.stack);
      console.error("Error message:", error?.message);
      res.status(500).json({ error: "Failed to fetch boosts", details: error?.message });
    }
  });

  app.post("/api/boosts/activate", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { boostId } = req.body;

      const balance = await storage.getBalance(userId);
      if (!balance) {
        return res.status(404).json({ error: "User not found" });
      }

      const tables = await getTables();
      const db = await getDb();
      const [boost] = await db.select().from(tables.boosts).where(eq(tables.boosts.id, boostId)).limit(1);
      if (!boost) {
        return res.status(404).json({ error: "Boost not found" });
      }

      if (balance.balance < boost.price) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const expiresAt = new Date(Date.now() + boost.durationSeconds * 1000);
      await storage.activateBoost(userId, boostId, expiresAt);
      await storage.updateBalance(userId, -boost.price);
      await storage.createTransaction(userId, "boost_buy", -boost.price, { boostId });

      res.json({ success: true });
    } catch (error) {
      console.error("Boost activate error:", error);
      res.status(500).json({ error: "Failed to activate boost" });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const allTasks = await storage.getTasks();
      const userTasks = await storage.getUserTasks(userId);

      const tasksWithStatus = allTasks.map((task) => {
        const userTask = userTasks.find((ut) => ut.taskId === task.id);
        return {
          ...task,
          status: userTask?.status || "new",
        };
      });

      res.json({ tasks: tasksWithStatus });
    } catch (error) {
      console.error("Tasks error:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks/start", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { taskId } = req.body;

      const userTasks = await storage.getUserTasks(userId);
      const existing = userTasks.find((ut) => ut.taskId === taskId);

      if (!existing) {
        await storage.createUserTask(userId, taskId);
      } else {
        await storage.updateUserTaskStatus(userId, taskId, "in_progress");
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Task start error:", error);
      res.status(500).json({ error: "Failed to start task" });
    }
  });

  app.post("/api/tasks/verify", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { taskId } = req.body;

      await storage.updateUserTaskStatus(userId, taskId, "checking");

      res.json({ success: true });
    } catch (error) {
      console.error("Task verify error:", error);
      res.status(500).json({ error: "Failed to verify task" });
    }
  });

  app.post("/api/tasks/claim", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { taskId } = req.body;

      const tables = await getTables();
      const db = await getDb();
      const [task] = await db.select().from(tables.tasks).where(eq(tables.tasks.id, taskId)).limit(1);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      await storage.updateUserTaskStatus(userId, taskId, "done");
      await storage.updateBalance(userId, Number(task.reward));
      await storage.addXP(userId, Number(task.reward) / 10);
      await storage.createTransaction(userId, "task", Number(task.reward), { taskId });

      res.json({ success: true, reward: task.reward });
    } catch (error) {
      console.error("Task claim error:", error);
      res.status(500).json({ error: "Failed to claim task" });
    }
  });

  app.get("/api/referrals", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const referralsList = await storage.getReferrals(userId);

      const friends = await Promise.all(
        referralsList.map(async (ref) => {
          const friend = await storage.getUser(ref.friendId);
          return {
            id: friend?.id || 0,
            username: friend?.username || "",
            firstName: friend?.firstName || "",
            earned: 1000,
          };
        })
      );

      res.json({
        invitedCount: friends.length,
        activeCount: friends.length,
        totalEarned: friends.length * 1000,
        friends,
      });
    } catch (error) {
      console.error("Referrals error:", error);
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });

  app.get("/api/articles", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const allArticles = await storage.getArticles();
      const completedIds = await storage.getUserArticles(userId);

      const articlesWithStatus = allArticles.map((article) => ({
        ...article,
        isCompleted: completedIds.includes(article.id),
      }));

      res.json({ articles: articlesWithStatus });
    } catch (error) {
      console.error("Articles error:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.post("/api/articles/complete", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { articleId } = req.body;

      const tables = await getTables();
      const db = await getDb();
      const [article] = await db.select().from(tables.articles).where(eq(tables.articles.id, articleId)).limit(1);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const completedIds = await storage.getUserArticles(userId);
      if (completedIds.includes(articleId)) {
        return res.status(400).json({ error: "Article already completed" });
      }

      await storage.markArticleComplete(userId, articleId);
      await storage.updateBalance(userId, Number(article.reward));
      await storage.addXP(userId, Number(article.reward) / 10);
      await storage.createTransaction(userId, "article", Number(article.reward), { articleId });

      res.json({ success: true, reward: article.reward });
    } catch (error) {
      console.error("Article complete error:", error);
      res.status(500).json({ error: "Failed to complete article" });
    }
  });

  app.post("/api/promo/claim", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { code } = req.body;

      const promo = await storage.getPromoCode(code);
      if (!promo) {
        return res.status(404).json({ error: "Invalid promo code" });
      }

      if (promo.usedCount >= promo.maxUsage) {
        return res.status(400).json({ error: "Promo code limit reached" });
      }

      if (promo.expiresAt && new Date() > promo.expiresAt) {
        return res.status(400).json({ error: "Promo code expired" });
      }

      const hasUsed = await storage.hasUsedPromoCode(userId, promo.id);
      if (hasUsed) {
        return res.status(400).json({ error: "Promo code already used" });
      }

      await storage.usePromoCode(userId, promo.id);
      await storage.updateBalance(userId, Number(promo.reward));
      await storage.createTransaction(userId, "promo", Number(promo.reward), { code });

      res.json({ success: true, reward: promo.reward });
    } catch (error) {
      console.error("Promo claim error:", error);
      res.status(500).json({ error: "Failed to claim promo code" });
    }
  });

  app.get("/api/daily-login", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const lastLogin = await storage.getDailyLogin(userId);
      
      if (!lastLogin) {
        return res.json({ streak: 1, canClaim: true });
      }

      const lastLoginDate = new Date(lastLogin.loginDate);
      const today = new Date();
      const diffTime = today.getTime() - lastLoginDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let streak = lastLogin.streak;
      let canClaim = true;

      if (diffDays === 0) {
        canClaim = !lastLogin.rewardClaimed;
      } else if (diffDays === 1) {
        streak += 1;
      } else {
        streak = 1;
      }

      res.json({ streak, canClaim });
    } catch (error) {
      console.error("Daily login error:", error);
      res.status(500).json({ error: "Failed to fetch daily login" });
    }
  });

  app.post("/api/daily-login/claim", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const lastLogin = await storage.getDailyLogin(userId);
      let streak = 1;

      if (lastLogin) {
        const lastLoginDate = new Date(lastLogin.loginDate);
        const today = new Date();
        const diffTime = today.getTime() - lastLoginDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0 && lastLogin.rewardClaimed) {
          return res.status(400).json({ error: "Already claimed today" });
        } else if (diffDays === 1) {
          streak = lastLogin.streak + 1;
        } else if (diffDays > 1) {
          streak = 1;
        } else {
          streak = lastLogin.streak;
        }
      }

      const reward = streak * 100;
      await storage.createOrUpdateDailyLogin(userId, streak);
      await storage.updateBalance(userId, reward);
      await storage.createTransaction(userId, "daily_login", reward, { streak });

      res.json({ success: true, reward, streak });
    } catch (error) {
      console.error("Daily login claim error:", error);
      res.status(500).json({ error: "Failed to claim daily login" });
    }
  });

  // Vercel uchun Server kerak emas, chunki Vercel o'zi request'larni handle qiladi
  // Lekin development uchun Server kerak
  const isVercel = !!process.env.VERCEL;
  
  if (isVercel) {
    // Vercel'da Server yaratmaymiz, faqat routes qo'shildi
    console.log("✅ Routes registered for Vercel");
    return null as any; // Vercel'da Server kerak emas
  } else {
    // Development uchun Server yaratamiz
    const httpServer = createServer(app);
    console.log("✅ Routes registered and Server created");
    return httpServer;
  }
}
