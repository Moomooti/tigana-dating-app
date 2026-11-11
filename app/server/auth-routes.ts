import { Router } from "express";
import { db } from "./db";
import { users, phoneVerifications, userSessions } from "@shared/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";

const router = Router();

// 전화번호 인증 코드 전송
router.post("/send-verification", async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone || phone.length !== 11) {
      return res.status(400).json({ message: "올바른 전화번호를 입력해주세요." });
    }

    // 기존 회원인지 확인
    const existingUser = await db.select().from(users).where(eq(users.phone, phone));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "이미 가입되어 있습니다. 로그인을 해주세요." });
    }

    // 6자리 랜덤 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60000); // 1분 후 만료

    // 기존 인증 코드 삭제 후 새로 생성
    await db.delete(phoneVerifications).where(eq(phoneVerifications.phone, phone));
    await db.insert(phoneVerifications).values({
      phone,
      code,
      expiresAt
    });

    // 실제 환경에서는 SMS API를 사용하여 전송
    console.log(`인증코드 ${phone}: ${code}`);
    
    res.json({ message: "인증코드가 전송되었습니다.", code }); // 개발용으로 코드 포함
  } catch (error) {
    console.error("Send verification error:", error);
    res.status(500).json({ message: "인증코드 전송 중 오류가 발생했습니다." });
  }
});

// 전화번호 인증 확인 (개발용 - 모든 6자리 숫자 통과)
router.post("/verify-phone", async (req, res) => {
  try {
    const { phone, code } = req.body;

    // 개발용: 6자리 숫자면 모두 통과
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: "6자리 숫자를 입력해주세요." });
    }

    // 기존 인증 기록이 있으면 업데이트, 없으면 생성
    const verification = await db.select()
      .from(phoneVerifications)
      .where(eq(phoneVerifications.phone, phone))
      .orderBy(phoneVerifications.createdAt);

    if (verification.length > 0) {
      const latest = verification[verification.length - 1];
      await db.update(phoneVerifications)
        .set({ verified: true })
        .where(eq(phoneVerifications.id, latest.id));
    } else {
      // 인증 기록이 없으면 새로 생성
      await db.insert(phoneVerifications).values({
        phone,
        code,
        expiresAt: new Date(Date.now() + 60000),
        verified: true
      });
    }

    res.json({ message: "인증이 완료되었습니다." });
  } catch (error) {
    console.error("Verify phone error:", error);
    res.status(500).json({ message: "인증 중 오류가 발생했습니다." });
  }
});

// 회원가입
router.post("/signup", async (req, res) => {
  try {
    const { phone, email, password, name, age, gender, bio, location, occupation, mainPhotoUrl, bestKeyword, favoriteMovieTitle, favoritePlaceKeyword, freeKeyword } = req.body;

    // 전화번호 인증 확인
    const verification = await db.select()
      .from(phoneVerifications)
      .where(eq(phoneVerifications.phone, phone))
      .orderBy(phoneVerifications.createdAt);

    if (verification.length === 0 || !verification[verification.length - 1].verified) {
      return res.status(400).json({ message: "전화번호 인증이 필요합니다." });
    }

    // 중복 회원 확인
    const existingUser = await db.select()
      .from(users)
      .where(or(eq(users.phone, phone), eq(users.email, email)));

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "이미 가입되어 있습니다." });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const [newUser] = await db.insert(users).values({
      phone,
      email,
      password: hashedPassword,
      name,
      age,
      gender,
      bio: bio || "",
      location: location || "",
      occupation: occupation || "",
      mainPhotoUrl: mainPhotoUrl || "/default-avatar.png",
      bestKeyword: bestKeyword || "",
      favoriteMovieTitle: favoriteMovieTitle || "",
      favoritePlaceKeyword: favoritePlaceKeyword || "",
      freeKeyword: freeKeyword || "",
      phoneVerified: true
    }).returning();

    // 인증 코드 정리
    await db.delete(phoneVerifications).where(eq(phoneVerifications.phone, phone));

    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ message: "회원가입이 완료되었습니다.", user: userWithoutPassword });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    // 전화번호 또는 이메일로 사용자 찾기
    const user = await db.select()
      .from(users)
      .where(or(eq(users.phone, identifier), eq(users.email, identifier)));

    if (user.length === 0) {
      return res.status(400).json({ message: "존재하지 않는 계정입니다." });
    }

    const foundUser = user[0];

    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "비밀번호가 올바르지 않습니다." });
    }

    // 세션 생성 (remember me 옵션에 따라 만료시간 설정)
    const expiresAt = rememberMe 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30일
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 1일

    const [session] = await db.insert(userSessions).values({
      userId: foundUser.id,
      phone: foundUser.phone,
      email: foundUser.email,
      rememberMe: rememberMe || false,
      expiresAt
    }).returning();

    const { password: _, ...userWithoutPassword } = foundUser;
    res.json({ 
      message: "로그인이 완료되었습니다.", 
      user: userWithoutPassword,
      sessionId: session.id
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
  }
});

// 계정 찾기
router.post("/find-account", async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ message: "전화번호 또는 이메일을 입력해주세요." });
    }

    const user = await db.select()
      .from(users)
      .where(phone ? eq(users.phone, phone) : eq(users.email, email));

    if (user.length === 0) {
      return res.status(400).json({ message: "등록된 계정을 찾을 수 없습니다." });
    }

    const foundUser = user[0];
    res.json({
      message: "계정을 찾았습니다.",
      phone: foundUser.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'),
      email: foundUser.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    });
  } catch (error) {
    console.error("Find account error:", error);
    res.status(500).json({ message: "계정 찾기 중 오류가 발생했습니다." });
  }
});

export default router;