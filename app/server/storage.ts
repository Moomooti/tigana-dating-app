import { 
  users, 
  swipes, 
  matches, 
  conversations, 
  messages,
  userSessions,
  phoneVerifications,
  type User, 
  type InsertUser, 
  type Swipe, 
  type InsertSwipe, 
  type Match, 
  type Conversation, 
  type Message, 
  type InsertMessage,
  type InsertUserSession
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getAllUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySession(sessionId: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  createUserSession(session: InsertUserSession): Promise<{ id: string }>;
  
  // Swipe operations
  createSwipe(insertSwipe: InsertSwipe): Promise<Swipe>;
  getSwipesByUser(userId: string): Promise<Swipe[]>;
  checkMutualLike(userId: string, targetUserId: string): Promise<boolean>;
  
  // Match operations
  createMatch(userId1: string, userId2: string): Promise<Match>;
  getMatchesByUser(userId: string): Promise<Match[]>;
  
  // Conversation operations
  createConversation(matchId: string): Promise<Conversation>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>;
  
  // Message operations
  createMessage(insertMessage: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  
  // Admin operations - for getting all data
  getAllMatches(): Promise<Match[]>;
  getAllSwipes(): Promise<Swipe[]>;
  getAllConversations(): Promise<Conversation[]>;
  getAllMessages(): Promise<Message[]>;
  getAllPhoneVerifications(): Promise<any[]>;
  getAllUserSessions(): Promise<any[]>;
  
  // Developer operations
  initializeDeveloperAccounts(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async createSwipe(insertSwipe: InsertSwipe): Promise<Swipe> {
    const [swipe] = await db.insert(swipes).values(insertSwipe).returning();
    return swipe;
  }

  async getSwipesByUser(userId: string): Promise<Swipe[]> {
    return await db.select().from(swipes).where(eq(swipes.userId, userId));
  }

  async checkMutualLike(userId: string, targetUserId: string): Promise<boolean> {
    const [mutualSwipe] = await db.select()
      .from(swipes)
      .where(
        and(
          eq(swipes.userId, targetUserId),
          eq(swipes.targetUserId, userId),
          eq(swipes.liked, true)
        )
      );
    return !!mutualSwipe;
  }

  async createMatch(userId1: string, userId2: string): Promise<Match> {
    const [match] = await db.insert(matches).values({
      userId1,
      userId2
    }).returning();
    return match;
  }

  async getMatchesByUser(userId: string): Promise<Match[]> {
    return await db.select()
      .from(matches)
      .where(or(eq(matches.userId1, userId), eq(matches.userId2, userId)));
  }

  async createConversation(matchId: string): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values({
      matchId
    }).returning();
    return conversation;
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    // Get conversations where the user is part of the match
    const userMatches = await this.getMatchesByUser(userId);
    const matchIds = userMatches.map(match => match.id);
    
    if (matchIds.length === 0) return [];
    
    return await db.select()
      .from(conversations)
      .where(or(...matchIds.map(matchId => eq(conversations.matchId, matchId))));
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const [conversation] = await db.update(conversations)
      .set(updates)
      .where(eq(conversations.id, id))
      .returning();
    return conversation;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async getUserBySession(sessionId: string): Promise<User | undefined> {
    // 세션에서 사용자 ID 찾기
    const [session] = await db.select()
      .from(userSessions)
      .where(eq(userSessions.id, sessionId));

    if (!session) {
      return undefined;
    }

    // 세션 만료 확인
    if (session.expiresAt < new Date()) {
      return undefined;
    }
    
    // 사용자 정보 반환
    return this.getUser(session.userId);
  }

  // Admin operations - for getting all data
  async getAllMatches(): Promise<Match[]> {
    return await db.select().from(matches);
  }

  async getAllSwipes(): Promise<Swipe[]> {
    return await db.select().from(swipes);
  }

  async getAllConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations);
  }

  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }

  async getAllPhoneVerifications(): Promise<any[]> {
    return await db.select().from(phoneVerifications);
  }

  async getAllUserSessions(): Promise<any[]> {
    return await db.select().from(userSessions);
  }

  async createUserSession(session: InsertUserSession): Promise<{ id: string }> {
    const [result] = await db.insert(userSessions).values(session).returning({ id: userSessions.id });
    return result;
  }

  // Developer operations
  async initializeDeveloperAccounts(): Promise<void> {
    // 개발자 계정은 코드에 적지 않고 환경 변수로만 설정합니다.
    //   DEV_ACCOUNT_EMAILS=dev1@example.com,dev2@example.com
    //   DEV_ACCOUNT_PASSWORD=강력한_비밀번호
    const emails = (process.env.DEV_ACCOUNT_EMAILS || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    const devPassword = process.env.DEV_ACCOUNT_PASSWORD;
    if (emails.length === 0 || !devPassword) {
      console.log("DEV_ACCOUNT_EMAILS / DEV_ACCOUNT_PASSWORD 미설정: 개발자 계정 생성을 건너뜁니다.");
      return;
    }

    const developerAccounts = emails.map((email, i) => ({
      email,
      phone: `0100000000${i + 1}`,
      password: devPassword,
      name: `개발자${i + 1}`,
      age: 28,
      gender: "male",
      bio: "앱 개발자입니다",
      location: "서울시 강남구",
      occupation: "개발자",
      mainPhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      bestKeyword: "개발",
      favoriteMovieTitle: "매트릭스",
      favoritePlaceKeyword: "카페",
      freeKeyword: "코딩",
      isDeveloper: true,
      keywordsCompleted: true,
      phoneVerified: true,
      emailVerified: true,
    }));

    for (const devAccount of developerAccounts) {
      // Check if developer account already exists
      const existingUser = await this.getUserByEmail(devAccount.email);
      if (!existingUser) {
        await this.createUser(devAccount);
        console.log(`Developer account created: ${devAccount.email}`);
      }
    }
  }
}

export const storage = new DatabaseStorage();