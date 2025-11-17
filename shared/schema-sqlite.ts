import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  telegramId: integer("telegram_id").notNull().unique(),
  username: text("username"),
  firstName: text("first_name"),
  language: text("language").default("uz"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  referrerId: integer("referrer_id"),
  theme: text("theme").default("auto"),
});

export const balances = sqliteTable("balances", {
  userId: integer("user_id").primaryKey().references(() => users.id),
  balance: integer("balance").default(0).notNull(),
  hourlyIncome: integer("hourly_income").default(0).notNull(),
  totalTaps: integer("total_taps").default(0).notNull(),
  energy: integer("energy").default(1000).notNull(),
  maxEnergy: integer("max_energy").default(1000).notNull(),
  energyUpdatedAt: integer("energy_updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
});

export const boosts = sqliteTable("boosts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  price: integer("price").notNull(),
});

export const userBoosts = sqliteTable("user_boosts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  boostId: integer("boost_id").notNull().references(() => boosts.id),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: integer("reward").notNull(),
  link: text("link"),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const userTasks = sqliteTable("user_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  status: text("status").default("new").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const referrals = sqliteTable("referrals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  friendId: integer("friend_id").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  bonusGiven: integer("bonus_given", { mode: "boolean" }).default(false).notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  meta: text("meta"), // JSON string for SQLite
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const promoCodes = sqliteTable("promo_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  reward: integer("reward").notNull(),
  maxUsage: integer("max_usage").notNull(),
  usedCount: integer("used_count").default(0).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
});

export const promoCodeUsages = sqliteTable("promo_code_usages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  promoId: integer("promo_id").notNull().references(() => promoCodes.id),
  usedAt: integer("used_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  reward: integer("reward").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const userArticles = sqliteTable("user_articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  articleId: integer("article_id").notNull().references(() => articles.id),
  completedAt: integer("completed_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const dailyLogins = sqliteTable("daily_logins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  loginDate: integer("login_date", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  streak: integer("streak").default(1).notNull(),
  rewardClaimed: integer("reward_claimed", { mode: "boolean" }).default(false).notNull(),
});

// Relations (same as PostgreSQL)
export const usersRelations = relations(users, ({ one, many }) => ({
  balance: one(balances, {
    fields: [users.id],
    references: [balances.userId],
  }),
  referrer: one(users, {
    fields: [users.referrerId],
    references: [users.id],
  }),
  userBoosts: many(userBoosts),
  userTasks: many(userTasks),
  referrals: many(referrals, { relationName: "referrer" }),
  referredBy: many(referrals, { relationName: "friend" }),
  transactions: many(transactions),
  promoCodeUsages: many(promoCodeUsages),
  userArticles: many(userArticles),
  dailyLogins: many(dailyLogins),
}));

export const balancesRelations = relations(balances, ({ one }) => ({
  user: one(users, {
    fields: [balances.userId],
    references: [users.id],
  }),
}));

export const boostsRelations = relations(boosts, ({ many }) => ({
  userBoosts: many(userBoosts),
}));

export const userBoostsRelations = relations(userBoosts, ({ one }) => ({
  user: one(users, {
    fields: [userBoosts.userId],
    references: [users.id],
  }),
  boost: one(boosts, {
    fields: [userBoosts.boostId],
    references: [boosts.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ many }) => ({
  userTasks: many(userTasks),
}));

export const userTasksRelations = relations(userTasks, ({ one }) => ({
  user: one(users, {
    fields: [userTasks.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [userTasks.taskId],
    references: [tasks.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  friend: one(users, {
    fields: [referrals.friendId],
    references: [users.id],
    relationName: "friend",
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const promoCodesRelations = relations(promoCodes, ({ many }) => ({
  usages: many(promoCodeUsages),
}));

export const promoCodeUsagesRelations = relations(promoCodeUsages, ({ one }) => ({
  user: one(users, {
    fields: [promoCodeUsages.userId],
    references: [users.id],
  }),
  promoCode: one(promoCodes, {
    fields: [promoCodeUsages.promoId],
    references: [promoCodes.id],
  }),
}));

export const articlesRelations = relations(articles, ({ many }) => ({
  userArticles: many(userArticles),
}));

export const userArticlesRelations = relations(userArticles, ({ one }) => ({
  user: one(users, {
    fields: [userArticles.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [userArticles.articleId],
    references: [articles.id],
  }),
}));

export const dailyLoginsRelations = relations(dailyLogins, ({ one }) => ({
  user: one(users, {
    fields: [dailyLogins.userId],
    references: [users.id],
  }),
}));

// Zod schemas
const _insertUserSchema = createInsertSchema(users);
export const insertUserSchema = _insertUserSchema.omit({ id: true, createdAt: true, lastLoginAt: true });

const _insertBalanceSchema = createInsertSchema(balances);
export const insertBalanceSchema = _insertBalanceSchema.omit({ energyUpdatedAt: true });

const _insertBoostSchema = createInsertSchema(boosts);
export const insertBoostSchema = _insertBoostSchema.omit({ id: true });

const _insertUserBoostSchema = createInsertSchema(userBoosts);
export const insertUserBoostSchema = _insertUserBoostSchema.omit({ id: true, startedAt: true, isActive: true });

const _insertTaskSchema = createInsertSchema(tasks);
export const insertTaskSchema = _insertTaskSchema.omit({ id: true, createdAt: true });

const _insertUserTaskSchema = createInsertSchema(userTasks);
export const insertUserTaskSchema = _insertUserTaskSchema.omit({ id: true, updatedAt: true });

const _insertReferralSchema = createInsertSchema(referrals);
export const insertReferralSchema = _insertReferralSchema.omit({ id: true, createdAt: true, bonusGiven: true });

const _insertTransactionSchema = createInsertSchema(transactions);
export const insertTransactionSchema = _insertTransactionSchema.omit({ id: true, createdAt: true });

const _insertPromoCodeSchema = createInsertSchema(promoCodes);
export const insertPromoCodeSchema = _insertPromoCodeSchema.omit({ id: true, usedCount: true });

const _insertPromoCodeUsageSchema = createInsertSchema(promoCodeUsages);
export const insertPromoCodeUsageSchema = _insertPromoCodeUsageSchema.omit({ id: true, usedAt: true });

const _insertArticleSchema = createInsertSchema(articles);
export const insertArticleSchema = _insertArticleSchema.omit({ id: true, createdAt: true });

const _insertUserArticleSchema = createInsertSchema(userArticles);
export const insertUserArticleSchema = _insertUserArticleSchema.omit({ id: true, completedAt: true });

const _insertDailyLoginSchema = createInsertSchema(dailyLogins);
export const insertDailyLoginSchema = _insertDailyLoginSchema.omit({ id: true, loginDate: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBalance = z.infer<typeof insertBalanceSchema>;
export type Balance = typeof balances.$inferSelect;

export type InsertBoost = z.infer<typeof insertBoostSchema>;
export type Boost = typeof boosts.$inferSelect;

export type InsertUserBoost = z.infer<typeof insertUserBoostSchema>;
export type UserBoost = typeof userBoosts.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertUserTask = z.infer<typeof insertUserTaskSchema>;
export type UserTask = typeof userTasks.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;

export type InsertPromoCodeUsage = z.infer<typeof insertPromoCodeUsageSchema>;
export type PromoCodeUsage = typeof promoCodeUsages.$inferSelect;

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export type InsertUserArticle = z.infer<typeof insertUserArticleSchema>;
export type UserArticle = typeof userArticles.$inferSelect;

export type InsertDailyLogin = z.infer<typeof insertDailyLoginSchema>;
export type DailyLogin = typeof dailyLogins.$inferSelect;

