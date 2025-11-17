import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// SQLite yoki PostgreSQL uchun mos schema import
const useSQLite = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:') || process.env.DATABASE_URL.endsWith('.db');
const schema = useSQLite 
  ? await import('@shared/schema-sqlite')
  : await import('@shared/schema');

const {
  users,
  balances,
  boosts,
  userBoosts,
  tasks,
  userTasks,
  referrals,
  transactions,
  promoCodes,
  promoCodeUsages,
  articles,
  userArticles,
  dailyLogins,
} = schema;

// Types - schema dan to'g'ridan-to'g'ri export qilingan typelarni ishlatamiz
type User = schema.User;
type InsertUser = schema.InsertUser;
type Balance = schema.Balance;
type InsertBalance = schema.InsertBalance;
type Boost = schema.Boost;
type UserBoost = schema.UserBoost;
type Task = schema.Task;
type UserTask = schema.UserTask;
type Referral = schema.Referral;
type Transaction = schema.Transaction;
type PromoCode = schema.PromoCode;
type Article = schema.Article;
type UserArticle = schema.UserArticle;
type DailyLogin = schema.DailyLogin;

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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByTelegramId(telegramId: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (useSQLite) {
      // SQLite uchun returning() ishlamaydi, shuning uchun insert qilgandan keyin select qilamiz
      await db.insert(users).values(insertUser);
      const [user] = await db.select().from(users).where(eq(users.telegramId, insertUser.telegramId));
      if (!user) throw new Error("Failed to create user");
      return user;
    } else {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    }
  }

  async updateUserLogin(id: number): Promise<void> {
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, id));
  }

  async getBalance(userId: number): Promise<Balance | undefined> {
    try {
      const [balance] = await db.select().from(balances).where(eq(balances.userId, userId));
      return balance || undefined;
    } catch (error) {
      console.error("getBalance error:", error);
      throw error;
    }
  }

  async createBalance(insertBalance: InsertBalance): Promise<Balance> {
    if (useSQLite) {
      // SQLite uchun returning() ishlamaydi
      await db.insert(balances).values(insertBalance);
      const [balance] = await db.select().from(balances).where(eq(balances.userId, insertBalance.userId));
      if (!balance) throw new Error("Failed to create balance");
      return balance;
    } else {
      const [balance] = await db.insert(balances).values(insertBalance).returning();
      return balance;
    }
  }

  async updateBalance(userId: number, amount: number): Promise<void> {
    try {
      const [currentBalance] = await db.select().from(balances).where(eq(balances.userId, userId));
      if (!currentBalance) {
        throw new Error(`Balance not found for userId: ${userId}`);
      }
      const newBalance = Number(currentBalance.balance || 0) + amount;
      await db
        .update(balances)
        .set({ balance: newBalance })
        .where(eq(balances.userId, userId));
    } catch (error) {
      console.error("updateBalance error:", error);
      throw error;
    }
  }

  async updateEnergy(userId: number, energy: number): Promise<void> {
    try {
      // SQLite uchun timestamp Date object sifatida yuboriladi
      await db
        .update(balances)
        .set({ 
          energy, 
          energyUpdatedAt: new Date() 
        })
        .where(eq(balances.userId, userId));
    } catch (error) {
      console.error("updateEnergy error:", error);
      throw error;
    }
  }

  async incrementTaps(userId: number, amount: number): Promise<void> {
    try {
      const [currentBalance] = await db.select().from(balances).where(eq(balances.userId, userId));
      if (!currentBalance) {
        throw new Error(`Balance not found for userId: ${userId}`);
      }
      const newTaps = Number(currentBalance.totalTaps || 0) + amount;
      await db
        .update(balances)
        .set({ totalTaps: newTaps })
        .where(eq(balances.userId, userId));
    } catch (error) {
      console.error("incrementTaps error:", error);
      throw error;
    }
  }

  async addXP(userId: number, xp: number): Promise<void> {
    try {
      const [balance] = await db.select().from(balances).where(eq(balances.userId, userId));
      if (!balance) {
        throw new Error(`Balance not found for userId: ${userId}`);
      }
      const newXP = Number(balance.xp || 0) + xp;
      const newLevel = Math.floor(newXP / 1000) + 1;
      await db
        .update(balances)
        .set({ xp: newXP, level: newLevel })
        .where(eq(balances.userId, userId));
    } catch (error) {
      console.error("addXP error:", error);
      throw error;
    }
  }

  async getBoosts(): Promise<Boost[]> {
    try {
      return await db.select().from(boosts);
    } catch (error) {
      console.error("getBoosts error:", error);
      throw error;
    }
  }

  async getUserActiveBoosts(userId: number): Promise<UserBoost[]> {
    try {
      const now = new Date();
      const allBoosts = await db
        .select()
        .from(userBoosts)
        .where(
          and(
            eq(userBoosts.userId, userId),
            eq(userBoosts.isActive, true)
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
    await db.insert(userBoosts).values({
      userId,
      boostId,
      expiresAt,
      isActive: true,
    });
  }

  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.isActive, true));
  }

  async getUserTasks(userId: number): Promise<UserTask[]> {
    return await db.select().from(userTasks).where(eq(userTasks.userId, userId));
  }

  async createUserTask(userId: number, taskId: number): Promise<UserTask> {
    if (useSQLite) {
      // SQLite uchun returning() ishlamaydi
      await db.insert(userTasks).values({ userId, taskId, status: "in_progress" });
      const [userTask] = await db
        .select()
        .from(userTasks)
        .where(and(eq(userTasks.userId, userId), eq(userTasks.taskId, taskId)));
      if (!userTask) throw new Error("Failed to create user task");
      return userTask;
    } else {
      const [userTask] = await db
        .insert(userTasks)
        .values({ userId, taskId, status: "in_progress" })
        .returning();
      return userTask;
    }
  }

  async updateUserTaskStatus(userId: number, taskId: number, status: string): Promise<void> {
    await db
      .update(userTasks)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(userTasks.userId, userId), eq(userTasks.taskId, taskId)));
  }

  async getReferrals(userId: number): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerId, userId));
  }

  async createReferral(referrerId: number, friendId: number): Promise<void> {
    await db.insert(referrals).values({ referrerId, friendId, bonusGiven: false });
  }

  async createTransaction(userId: number, type: string, amount: number, meta?: any): Promise<void> {
    try {
      // SQLite uchun meta JSON string sifatida saqlanadi
      const metaString = meta ? JSON.stringify(meta) : null;
      await db.insert(transactions).values({ userId, type, amount, meta: metaString });
    } catch (error) {
      console.error("createTransaction error:", error);
      throw error;
    }
  }

  async getPromoCode(code: string): Promise<PromoCode | undefined> {
    const [promo] = await db
      .select()
      .from(promoCodes)
      .where(and(eq(promoCodes.code, code), eq(promoCodes.isActive, true)));
    return promo || undefined;
  }

  async hasUsedPromoCode(userId: number, promoId: number): Promise<boolean> {
    const [usage] = await db
      .select()
      .from(promoCodeUsages)
      .where(and(eq(promoCodeUsages.userId, userId), eq(promoCodeUsages.promoId, promoId)));
    return !!usage;
  }

  async usePromoCode(userId: number, promoId: number): Promise<void> {
    await db.insert(promoCodeUsages).values({ userId, promoId });
    const [currentPromo] = await db.select().from(promoCodes).where(eq(promoCodes.id, promoId));
    if (currentPromo) {
      await db
        .update(promoCodes)
        .set({ usedCount: Number(currentPromo.usedCount) + 1 })
        .where(eq(promoCodes.id, promoId));
    }
  }

  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.isActive, true));
  }

  async getUserArticles(userId: number): Promise<number[]> {
    const completed = await db
      .select({ articleId: userArticles.articleId })
      .from(userArticles)
      .where(eq(userArticles.userId, userId));
    return completed.map((c) => c.articleId);
  }

  async markArticleComplete(userId: number, articleId: number): Promise<void> {
    await db.insert(userArticles).values({ userId, articleId });
  }

  async getDailyLogin(userId: number): Promise<DailyLogin | undefined> {
    const [login] = await db
      .select()
      .from(dailyLogins)
      .where(eq(dailyLogins.userId, userId))
      .orderBy(desc(dailyLogins.loginDate))
      .limit(1);
    return login || undefined;
  }

  async createOrUpdateDailyLogin(userId: number, streak: number): Promise<void> {
    await db.insert(dailyLogins).values({ userId, streak, rewardClaimed: true });
  }
}

export const storage = new DatabaseStorage();
