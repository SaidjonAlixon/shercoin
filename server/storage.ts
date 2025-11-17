import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// SQLite yoki PostgreSQL uchun mos schema import - lazy initialization
let schema: any = null;
let schemaInitialized = false;
let useSQLite = false;

async function getSchema() {
  if (schemaInitialized && schema) {
    return schema;
  }
  
  useSQLite = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:') || process.env.DATABASE_URL.endsWith('.db');
  schema = useSQLite 
    ? await import('@shared/schema-sqlite')
    : await import('@shared/schema');
  schemaInitialized = true;
  return schema;
}

// Helper function to get tables from schema
async function getTables() {
  const s = await getSchema();
  return {
    users: s.users,
    balances: s.balances,
    boosts: s.boosts,
    userBoosts: s.userBoosts,
    tasks: s.tasks,
    userTasks: s.userTasks,
    referrals: s.referrals,
    transactions: s.transactions,
    promoCodes: s.promoCodes,
    promoCodeUsages: s.promoCodeUsages,
    articles: s.articles,
    userArticles: s.userArticles,
    dailyLogins: s.dailyLogins,
  };
}

// Types - schema dan to'g'ridan-to'g'ri export qilingan typelarni ishlatamiz
// Bu types'lar runtime'da ishlatilmaydi, faqat TypeScript uchun
type User = any;
type InsertUser = any;
type Balance = any;
type InsertBalance = any;
type Boost = any;
type UserBoost = any;
type Task = any;
type UserTask = any;
type Referral = any;
type Transaction = any;
type PromoCode = any;
type Article = any;
type UserArticle = any;
type DailyLogin = any;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLogin(id: number): Promise<void>;
  
  getBalance(userId: number): Promise<Balance | undefined>;
  createBalance(balance: InsertBalance): Promise<Balance>;
  updateBalance(userId: number, amount: number): Promise<void>;
  updateEnergy(userId: number, energy: number): Promise<void>;
  incrementTaps(userId: number, amount: number): Promise<void>;
  addXP(userId: number, xp: number): Promise<void>;
  
  getBoosts(): Promise<Boost[]>;
  getUserActiveBoosts(userId: number): Promise<UserBoost[]>;
  activateBoost(userId: number, boostId: number, expiresAt: Date): Promise<void>;
  
  getTasks(): Promise<Task[]>;
  getUserTasks(userId: number): Promise<UserTask[]>;
  createUserTask(userId: number, taskId: number): Promise<UserTask>;
  updateUserTaskStatus(userId: number, taskId: number, status: string): Promise<void>;
  
  getReferrals(userId: number): Promise<Referral[]>;
  createReferral(referrerId: number, friendId: number): Promise<void>;
  
  createTransaction(userId: number, type: string, amount: number, meta?: any): Promise<void>;
  
  getPromoCode(code: string): Promise<PromoCode | undefined>;
  hasUsedPromoCode(userId: number, promoId: number): Promise<boolean>;
  usePromoCode(userId: number, promoId: number): Promise<void>;
  
  getArticles(): Promise<Article[]>;
  getUserArticles(userId: number): Promise<number[]>;
  markArticleComplete(userId: number, articleId: number): Promise<void>;
  
  getDailyLogin(userId: number): Promise<DailyLogin | undefined>;
  createOrUpdateDailyLogin(userId: number, streak: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const tables = await getTables();
      const [user] = await db.select().from(tables.users).where(eq(tables.users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("getUser error:", error);
      throw error;
    }
  }

  async getUserByTelegramId(telegramId: number): Promise<User | undefined> {
    try {
      const tables = await getTables();
      const [user] = await db.select().from(tables.users).where(eq(tables.users.telegramId, telegramId));
      return user || undefined;
    } catch (error) {
      console.error("getUserByTelegramId error:", error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const tables = await getTables();
      if (useSQLite) {
        // SQLite uchun returning() ishlamaydi, shuning uchun insert qilgandan keyin select qilamiz
        await db.insert(tables.users).values(insertUser);
        const [user] = await db.select().from(tables.users).where(eq(tables.users.telegramId, insertUser.telegramId));
        if (!user) throw new Error("Failed to create user");
        return user;
      } else {
        // PostgreSQL uchun returning() ishlaydi
        const [user] = await db.insert(tables.users).values(insertUser).returning();
        return user;
      }
    } catch (error) {
      console.error("createUser error:", error);
      throw error;
    }
  }

  async updateUserLogin(id: number): Promise<void> {
    try {
      const tables = await getTables();
      await db.update(tables.users).set({ lastLoginAt: new Date() }).where(eq(tables.users.id, id));
    } catch (error) {
      console.error("updateUserLogin error:", error);
      throw error;
    }
  }

  async getBalance(userId: number): Promise<Balance | undefined> {
    try {
      const tables = await getTables();
      const [balance] = await db.select().from(tables.balances).where(eq(tables.balances.userId, userId));
      return balance || undefined;
    } catch (error) {
      console.error("getBalance error:", error);
      throw error;
    }
  }

  async createBalance(insertBalance: InsertBalance): Promise<Balance> {
    try {
      const tables = await getTables();
      if (useSQLite) {
        // SQLite uchun returning() ishlamaydi
        await db.insert(tables.balances).values(insertBalance);
        const [balance] = await db.select().from(tables.balances).where(eq(tables.balances.userId, insertBalance.userId));
        if (!balance) throw new Error("Failed to create balance");
        return balance;
      } else {
        // PostgreSQL uchun returning() ishlaydi
        const [balance] = await db.insert(tables.balances).values(insertBalance).returning();
        return balance;
      }
    } catch (error) {
      console.error("createBalance error:", error);
      throw error;
    }
  }

  async updateBalance(userId: number, amount: number): Promise<void> {
    try {
      const tables = await getTables();
      const [currentBalance] = await db.select().from(tables.balances).where(eq(tables.balances.userId, userId));
      if (!currentBalance) {
        throw new Error(`Balance not found for userId: ${userId}`);
      }
      const newBalance = Number(currentBalance.balance || 0) + amount;
      await db
        .update(tables.balances)
        .set({ balance: newBalance })
        .where(eq(tables.balances.userId, userId));
    } catch (error) {
      console.error("updateBalance error:", error);
      throw error;
    }
  }

  async updateEnergy(userId: number, energy: number): Promise<void> {
    try {
      const tables = await getTables();
      await db
        .update(tables.balances)
        .set({ 
          energy, 
          energyUpdatedAt: new Date() 
        })
        .where(eq(tables.balances.userId, userId));
    } catch (error) {
      console.error("updateEnergy error:", error);
      throw error;
    }
  }

  async incrementTaps(userId: number, amount: number): Promise<void> {
    try {
      const tables = await getTables();
      const [currentBalance] = await db.select().from(tables.balances).where(eq(tables.balances.userId, userId));
      if (!currentBalance) {
        throw new Error(`Balance not found for userId: ${userId}`);
      }
      const newTaps = Number(currentBalance.totalTaps || 0) + amount;
      await db
        .update(tables.balances)
        .set({ totalTaps: newTaps })
        .where(eq(tables.balances.userId, userId));
    } catch (error) {
      console.error("incrementTaps error:", error);
      throw error;
    }
  }

  async addXP(userId: number, xp: number): Promise<void> {
    try {
      const tables = await getTables();
      const [balance] = await db.select().from(tables.balances).where(eq(tables.balances.userId, userId));
      if (!balance) {
        throw new Error(`Balance not found for userId: ${userId}`);
      }
      const newXP = Number(balance.xp || 0) + xp;
      const newLevel = Math.floor(newXP / 1000) + 1;
      await db
        .update(tables.balances)
        .set({ xp: newXP, level: newLevel })
        .where(eq(tables.balances.userId, userId));
    } catch (error) {
      console.error("addXP error:", error);
      throw error;
    }
  }

  async getBoosts(): Promise<Boost[]> {
    try {
      const tables = await getTables();
      return await db.select().from(tables.boosts);
    } catch (error) {
      console.error("getBoosts error:", error);
      throw error;
    }
  }

  async getUserActiveBoosts(userId: number): Promise<UserBoost[]> {
    try {
      const tables = await getTables();
      const now = new Date();
      const allBoosts = await db
        .select()
        .from(tables.userBoosts)
        .where(
          and(
            eq(tables.userBoosts.userId, userId),
            eq(tables.userBoosts.isActive, true)
          )
        );
      // SQLite uchun timestamp filtrlash
      return allBoosts.filter(boost => {
        try {
          let expiresAt: number;
          if (boost.expiresAt instanceof Date) {
            expiresAt = boost.expiresAt.getTime();
          } else if (typeof boost.expiresAt === 'number') {
            expiresAt = boost.expiresAt;
          } else {
            expiresAt = new Date(boost.expiresAt).getTime();
          }
          return expiresAt > now.getTime();
        } catch (e) {
          console.error("Error filtering boost:", e, boost);
          return false;
        }
      });
    } catch (error) {
      console.error("getUserActiveBoosts error:", error);
      throw error;
    }
  }

  async activateBoost(userId: number, boostId: number, expiresAt: Date): Promise<void> {
    try {
      const tables = await getTables();
      await db.insert(tables.userBoosts).values({
        userId,
        boostId,
        expiresAt,
        isActive: true,
      });
    } catch (error) {
      console.error("activateBoost error:", error);
      throw error;
    }
  }

  async getTasks(): Promise<Task[]> {
    try {
      const tables = await getTables();
      return await db.select().from(tables.tasks).where(eq(tables.tasks.isActive, true));
    } catch (error) {
      console.error("getTasks error:", error);
      throw error;
    }
  }

  async getUserTasks(userId: number): Promise<UserTask[]> {
    try {
      const tables = await getTables();
      return await db.select().from(tables.userTasks).where(eq(tables.userTasks.userId, userId));
    } catch (error) {
      console.error("getUserTasks error:", error);
      throw error;
    }
  }

  async createUserTask(userId: number, taskId: number): Promise<UserTask> {
    try {
      const tables = await getTables();
      if (useSQLite) {
        // SQLite uchun returning() ishlamaydi
        await db.insert(tables.userTasks).values({ userId, taskId, status: "in_progress" });
        const [userTask] = await db
          .select()
          .from(tables.userTasks)
          .where(and(eq(tables.userTasks.userId, userId), eq(tables.userTasks.taskId, taskId)));
        if (!userTask) throw new Error("Failed to create user task");
        return userTask;
      } else {
        // PostgreSQL uchun returning() ishlaydi
        const [userTask] = await db
          .insert(tables.userTasks)
          .values({ userId, taskId, status: "in_progress" })
          .returning();
        return userTask;
      }
    } catch (error) {
      console.error("createUserTask error:", error);
      throw error;
    }
  }

  async updateUserTaskStatus(userId: number, taskId: number, status: string): Promise<void> {
    try {
      const tables = await getTables();
      await db
        .update(tables.userTasks)
        .set({ status, updatedAt: new Date() })
        .where(and(eq(tables.userTasks.userId, userId), eq(tables.userTasks.taskId, taskId)));
    } catch (error) {
      console.error("updateUserTaskStatus error:", error);
      throw error;
    }
  }

  async getReferrals(userId: number): Promise<Referral[]> {
    try {
      const tables = await getTables();
      return await db.select().from(tables.referrals).where(eq(tables.referrals.referrerId, userId));
    } catch (error) {
      console.error("getReferrals error:", error);
      throw error;
    }
  }

  async createReferral(referrerId: number, friendId: number): Promise<void> {
    try {
      const tables = await getTables();
      await db.insert(tables.referrals).values({ referrerId, friendId, bonusGiven: false });
    } catch (error) {
      console.error("createReferral error:", error);
      throw error;
    }
  }

  async createTransaction(userId: number, type: string, amount: number, meta?: any): Promise<void> {
    try {
      const tables = await getTables();
      // SQLite uchun meta JSON string sifatida saqlanadi, PostgreSQL uchun JSONB
      const metaValue = meta ? (useSQLite ? JSON.stringify(meta) : meta) : null;
      await db.insert(tables.transactions).values({ userId, type, amount, meta: metaValue });
    } catch (error) {
      console.error("createTransaction error:", error);
      throw error;
    }
  }

  async getPromoCode(code: string): Promise<PromoCode | undefined> {
    try {
      const tables = await getTables();
      const [promo] = await db
        .select()
        .from(tables.promoCodes)
        .where(and(eq(tables.promoCodes.code, code), eq(tables.promoCodes.isActive, true)));
      return promo || undefined;
    } catch (error) {
      console.error("getPromoCode error:", error);
      throw error;
    }
  }

  async hasUsedPromoCode(userId: number, promoId: number): Promise<boolean> {
    try {
      const tables = await getTables();
      const [usage] = await db
        .select()
        .from(tables.promoCodeUsages)
        .where(and(eq(tables.promoCodeUsages.userId, userId), eq(tables.promoCodeUsages.promoId, promoId)));
      return !!usage;
    } catch (error) {
      console.error("hasUsedPromoCode error:", error);
      throw error;
    }
  }

  async usePromoCode(userId: number, promoId: number): Promise<void> {
    try {
      const tables = await getTables();
      await db.insert(tables.promoCodeUsages).values({ userId, promoId });
      const [currentPromo] = await db.select().from(tables.promoCodes).where(eq(tables.promoCodes.id, promoId));
      if (currentPromo) {
        await db
          .update(tables.promoCodes)
          .set({ usedCount: Number(currentPromo.usedCount) + 1 })
          .where(eq(tables.promoCodes.id, promoId));
      }
    } catch (error) {
      console.error("usePromoCode error:", error);
      throw error;
    }
  }

  async getArticles(): Promise<Article[]> {
    try {
      const tables = await getTables();
      return await db.select().from(tables.articles).where(eq(tables.articles.isActive, true));
    } catch (error) {
      console.error("getArticles error:", error);
      throw error;
    }
  }

  async getUserArticles(userId: number): Promise<number[]> {
    try {
      const tables = await getTables();
      const completed = await db
        .select({ articleId: tables.userArticles.articleId })
        .from(tables.userArticles)
        .where(eq(tables.userArticles.userId, userId));
      return completed.map((c) => c.articleId);
    } catch (error) {
      console.error("getUserArticles error:", error);
      throw error;
    }
  }

  async markArticleComplete(userId: number, articleId: number): Promise<void> {
    try {
      const tables = await getTables();
      await db.insert(tables.userArticles).values({ userId, articleId });
    } catch (error) {
      console.error("markArticleComplete error:", error);
      throw error;
    }
  }

  async getDailyLogin(userId: number): Promise<DailyLogin | undefined> {
    try {
      const tables = await getTables();
      const [login] = await db
        .select()
        .from(tables.dailyLogins)
        .where(eq(tables.dailyLogins.userId, userId))
        .orderBy(desc(tables.dailyLogins.loginDate))
        .limit(1);
      return login || undefined;
    } catch (error) {
      console.error("getDailyLogin error:", error);
      throw error;
    }
  }

  async createOrUpdateDailyLogin(userId: number, streak: number): Promise<void> {
    try {
      const tables = await getTables();
      await db.insert(tables.dailyLogins).values({ userId, streak, rewardClaimed: true });
    } catch (error) {
      console.error("createOrUpdateDailyLogin error:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
