import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Authentication fields
  phone: text("phone").unique().notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // "male", "female", "other"
  bio: text("bio").notNull(),
  location: text("location").notNull(),
  occupation: text("occupation").notNull(),
  
  // Profile images - four-part grid system (keyword-based)
  mainPhotoUrl: text("main_photo_url").notNull(), // Circular profile image
  bestKeyword: text("best_keyword").notNull(), // Grid 1: Best keyword/trait
  favoriteMovieTitle: text("favorite_movie_title").notNull(), // Grid 2: Movie title
  favoritePlaceKeyword: text("favorite_place_keyword").notNull(), // Grid 3: Place keyword
  freeKeyword: text("free_keyword").notNull(), // Grid 4: Free keyword/interest
  
  // Profile photo array (up to 5 photos)
  profilePhotos: text("profile_photos").array().default(sql`ARRAY[]::text[]`).notNull(),
  
  // User keyword selections
  keywordsCompleted: boolean("keywords_completed").default(false).notNull(),
  selectedKeywords: text("selected_keywords").array().default(sql`ARRAY[]::text[]`).notNull(),
  
  // Love Credits for app features
  loveCredits: integer("love_credits").default(50).notNull(),
  
  // Developer role
  isDeveloper: boolean("is_developer").default(false).notNull(),
  
  // User status
  isActive: boolean("is_active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 전화번호 인증 코드 테이블
export const phoneVerifications = pgTable("phone_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 로그인 세션 테이블
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  rememberMe: boolean("remember_me").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId1: varchar("user_id_1").notNull().references(() => users.id),
  userId2: varchar("user_id_2").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const swipes = pgTable("swipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  targetUserId: varchar("target_user_id").notNull().references(() => users.id),
  liked: boolean("liked").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  isAvatarMode: boolean("is_avatar_mode").default(true).notNull(), // Start in avatar mode
  avatarModeStartTime: timestamp("avatar_mode_start_time").defaultNow(),
  profilesRevealed: boolean("profiles_revealed").default(false).notNull(),
  profileRevealTime: timestamp("profile_reveal_time"),
  lastMessage: text("last_message"),
  lastMessageTime: timestamp("last_message_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"), // "text", "emoji", "system"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  phoneVerified: true,
  emailVerified: true,
});

export const insertPhoneVerificationSchema = createInsertSchema(phoneVerifications).omit({
  id: true,
  createdAt: true,
  verified: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertSwipeSchema = createInsertSchema(swipes).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  avatarModeStartTime: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type Swipe = typeof swipes.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type PhoneVerification = typeof phoneVerifications.$inferSelect;
export type InsertPhoneVerification = z.infer<typeof insertPhoneVerificationSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
