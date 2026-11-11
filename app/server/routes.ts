import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertSwipeSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import authRoutes from "./auth-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.use("/api/auth", authRoutes);

  // Developer login endpoint
  app.post("/api/developer-login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "존재하지 않는 계정입니다" });
      }

      // Check if user is a developer
      if (!user.isDeveloper) {
        return res.status(403).json({ message: "개발자 계정이 아닙니다" });
      }

      // Check password (in production, use proper password hashing)
      if (user.password !== password) {
        return res.status(401).json({ message: "비밀번호가 틀렸습니다" });
      }

      // Create session
      const session = {
        userId: user.id,
        phone: user.phone,
        email: user.email,
        rememberMe: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      const sessionResult = await storage.createUserSession(session);
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        sessionId: sessionResult.id
      });
    } catch (error) {
      console.error("Developer login error:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다" });
    }
  });
  // Get current user info (by session)
  app.get("/api/users/current-user", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      if (!sessionId) {
        return res.status(401).json({ message: "No session provided" });
      }

      const user = await storage.getUserBySession(sessionId);
      if (!user) {
        return res.status(401).json({ message: "Invalid session" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get current user keywords status
  app.get("/api/users/current-user/keywords-status", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      if (!sessionId) {
        return res.status(401).json({ message: "No session provided" });
      }

      const user = await storage.getUserBySession(sessionId);
      if (!user) {
        return res.status(401).json({ message: "Invalid session" });
      }

      res.json({ 
        keywordsCompleted: user.keywordsCompleted,
        selectedKeywords: user.selectedKeywords 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch keywords status" });
    }
  });

  // Get all users (potential matches)
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get potential matches for a user (users they haven't swiped on)
  app.get("/api/users/:userId/potential-matches", async (req, res) => {
    try {
      const { userId } = req.params;
      const allUsers = await storage.getAllUsers();
      const userSwipes = await storage.getSwipesByUser(userId);
      const swipedUserIds = new Set(userSwipes.map(swipe => swipe.targetUserId));
      
      const potentialMatches = allUsers.filter(user => 
        user.id !== userId && !swipedUserIds.has(user.id)
      );
      
      res.json(potentialMatches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch potential matches" });
    }
  });

  // Create a swipe
  app.post("/api/swipes", async (req, res) => {
    try {
      const swipeData = insertSwipeSchema.parse(req.body);
      const swipe = await storage.createSwipe(swipeData);
      
      // Check if this creates a mutual match
      let match = null;
      if (swipeData.liked) {
        const isMutualLike = await storage.checkMutualLike(
          swipeData.userId, 
          swipeData.targetUserId
        );
        
        if (isMutualLike) {
          match = await storage.createMatch(swipeData.userId, swipeData.targetUserId);
        }
      }
      
      res.json({ swipe, match });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid swipe data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create swipe" });
      }
    }
  });

  // Get user's matches
  app.get("/api/users/:userId/matches", async (req, res) => {
    try {
      const { userId } = req.params;
      const matches = await storage.getMatchesByUser(userId);
      
      // Get user details for each match
      const matchesWithUsers = await Promise.all(
        matches.map(async (match) => {
          const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
          const otherUser = await storage.getUser(otherUserId);
          return {
            ...match,
            otherUser
          };
        })
      );
      
      res.json(matchesWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Get user's conversations
  app.get("/api/users/:userId/conversations", async (req, res) => {
    try {
      const { userId } = req.params;
      const conversations = await storage.getConversationsByUser(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Create a user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  // Get a specific user
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get messages for a conversation
  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  // Reveal profiles in conversation
  app.post("/api/conversations/:conversationId/reveal-profiles", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const conversation = await storage.updateConversationToProfileMode(conversationId);
      
      // Send system message about profile reveal
      await storage.createMessage({
        conversationId,
        senderId: "system",
        content: "🎉 서로의 프로필이 공개되었습니다! 이제 더 깊은 대화를 나눠보세요.",
        messageType: "system"
      });
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to reveal profiles" });
    }
  });

  // Transfer credits when a user is skipped (skipper -> skipped)
  app.post("/api/connections/skip-credit", async (req, res) => {
    try {
      const { skipperId, skippedId, amount } = req.body as { skipperId: string; skippedId: string; amount?: number };

      if (!skipperId || !skippedId) {
        return res.status(400).json({ message: "skipperId와 skippedId가 필요합니다." });
      }

      const transferAmount = typeof amount === 'number' && amount > 0 ? amount : 3;

      const skipper = await storage.getUserById(skipperId);
      const skipped = await storage.getUserById(skippedId);

      if (!skipper || !skipped) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      const skipperCredits = skipper.loveCredits ?? 0;
      if (skipperCredits < transferAmount) {
        return res.status(400).json({ message: "크레딧이 부족합니다." });
      }

      await storage.updateUser(skipper.id, { loveCredits: skipperCredits - transferAmount });
      await storage.updateUser(skipped.id, { loveCredits: (skipped.loveCredits ?? 0) + transferAmount });

      res.json({
        success: true,
        from: skipper.id,
        to: skipped.id,
        amount: transferAmount,
      });
    } catch (error) {
      console.error("Skip credit transfer error:", error);
      res.status(500).json({ message: "크레딧 이전 중 오류가 발생했습니다." });
    }
  });

  // Save user keywords
  app.post("/api/users/keywords", async (req, res) => {
    try {
      const { keywords } = req.body;
      
      if (!Array.isArray(keywords)) {
        res.status(400).json({ message: "Keywords must be an array" });
        return;
      }
      
      // In a real app, you would get the user ID from the session/auth
      const userId = "current-user";
      const success = await storage.updateUserKeywords(userId, keywords);
      
      if (!success) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      
      res.json({ success: true, message: "Keywords saved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to save keywords" });
    }
  });

  // Check if user has completed keyword selection
  app.get("/api/users/:userId/keywords-status", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      
      res.json({ 
        keywordsCompleted: user.keywordsCompleted || false,
        keywordCount: user.selectedKeywords?.length || 0
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check keywords status" });
    }
  });

  // Profile setup endpoints
  app.post("/api/users/profile", async (req, res) => {
    try {
      const { nickname, phoneNumber, photos } = req.body;
      
      // In a real app, you would save the profile data to database
      // For now, just simulate success
      res.json({ 
        success: true, 
        message: "프로필이 성공적으로 저장되었습니다." 
      });
    } catch (error) {
      console.error("Profile save error:", error);
      res.status(500).json({ error: "프로필 저장 중 오류가 발생했습니다." });
    }
  });

  // Phone verification endpoints
  app.post("/api/auth/send-verification", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      // In a real app, you would send SMS via service like Twilio
      // For now, just simulate success
      console.log(`Sending verification code to ${phoneNumber}`);
      
      res.json({ 
        success: true, 
        message: "인증번호가 전송되었습니다." 
      });
    } catch (error) {
      console.error("SMS send error:", error);
      res.status(500).json({ error: "인증번호 전송 중 오류가 발생했습니다." });
    }
  });

  app.post("/api/auth/verify-phone", async (req, res) => {
    try {
      const { phoneNumber, verificationCode } = req.body;
      
      // In a real app, you would verify the code
      // For now, accept any 6-digit code
      if (verificationCode && verificationCode.length === 6) {
        res.json({ 
          success: true, 
          message: "전화번호 인증이 완료되었습니다." 
        });
      } else {
        res.status(400).json({ error: "잘못된 인증번호입니다." });
      }
    } catch (error) {
      console.error("Phone verification error:", error);
      res.status(500).json({ error: "인증 중 오류가 발생했습니다." });
    }
  });

  // Approval status endpoint
  app.get("/api/auth/approval-status", async (req, res) => {
    try {
      // Simulate approval process
      // In real app, check database for user approval status
      const now = Date.now();
      const approvalTime = 15000; // 15 seconds for demo
      
      // For demo, auto-approve after 15 seconds
      const isApproved = now % 30000 > approvalTime;
      
      if (isApproved) {
        res.json({
          status: "approved",
          message: "프로필 검토가 완료되었습니다.",
        });
      } else {
        res.json({
          status: "pending",
          message: "관리자가 프로필을 검토하고 있습니다.",
          estimatedTime: "1-2분",
        });
      }
    } catch (error) {
      console.error("Approval status error:", error);
      res.status(500).json({ error: "상태 확인 중 오류가 발생했습니다." });
    }
  });

  // Get user's selected keywords for display setup
  app.get("/api/users/current-user/selected-keywords", async (req, res) => {
    try {
      const userId = "current-user";
      const user = await storage.getUser(userId);
      
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      
      // Return user's keywords as simple array
      res.json({
        keywords: user.selectedKeywords || []
      });
    } catch (error) {
      console.error("Selected keywords fetch error:", error);
      res.status(500).json({ error: "키워드 정보를 가져오는 중 오류가 발생했습니다." });
    }
  });

  // 카카오페이 결제 준비 API
  app.post("/api/payments/kakaopay/ready", async (req, res) => {
    try {
      const { item_name, quantity, total_amount, credits } = req.body;
      
      // 실제 카카오페이 API 호출
      const kakaoPayParams = {
        cid: process.env.KAKAO_PAY_CID || "TC0ONETIME",
        partner_order_id: `tigana_${Date.now()}`,
        partner_user_id: "current-user",
        item_name,
        quantity,
        total_amount,
        tax_free_amount: 0,
        approval_url: `${req.protocol}://${req.get('host')}/api/payments/kakaopay/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/api/payments/kakaopay/cancel`,
        fail_url: `${req.protocol}://${req.get('host')}/api/payments/kakaopay/fail`
      };

      console.log(`실제 카카오페이 결제 준비: ${item_name} - ${total_amount}원`);

      try {
        // 실제 카카오페이 API 호출
        const kakaoResponse = await fetch('https://kapi.kakao.com/v1/payment/ready', {
          method: 'POST',
          headers: {
            'Authorization': `KakaoAK ${process.env.KAKAO_PAY_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
          },
          body: new URLSearchParams({
            cid: kakaoPayParams.cid,
            partner_order_id: kakaoPayParams.partner_order_id,
            partner_user_id: kakaoPayParams.partner_user_id,
            item_name: kakaoPayParams.item_name,
            quantity: kakaoPayParams.quantity.toString(),
            total_amount: kakaoPayParams.total_amount.toString(),
            tax_free_amount: kakaoPayParams.tax_free_amount.toString(),
            approval_url: kakaoPayParams.approval_url,
            cancel_url: kakaoPayParams.cancel_url,
            fail_url: kakaoPayParams.fail_url
          }).toString()
        });

        if (!kakaoResponse.ok) {
          const errorText = await kakaoResponse.text();
          console.error('카카오페이 API 오류:', errorText);
          throw new Error(`카카오페이 API 호출 실패: ${kakaoResponse.status}`);
        }

        const paymentData = await kakaoResponse.json();
        console.log('카카오페이 결제 준비 성공:', paymentData);

        // 결제 정보를 임시 저장 (실제로는 데이터베이스에 저장)
        (global as any).tempPayments = (global as any).tempPayments || {};
        (global as any).tempPayments[paymentData.tid] = {
          tid: paymentData.tid,
          orderId: kakaoPayParams.partner_order_id,
          amount: total_amount,
          credits,
          item_name,
          status: 'READY',
          created_at: new Date().toISOString()
        };

        res.json({
          ...paymentData,
          real_kakaopay: true
        });
      } catch (apiError) {
        console.error('카카오페이 API 호출 실패:', apiError);
        
        // API 호출 실패 시 시뮬레이션으로 fallback
        console.log('시뮬레이션 모드로 fallback');
        const tid = `T${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        
        (global as any).tempPayments = (global as any).tempPayments || {};
        (global as any).tempPayments[tid] = {
          tid,
          orderId: kakaoPayParams.partner_order_id,
          amount: total_amount,
          credits,
          item_name,
          status: 'READY',
          created_at: new Date().toISOString()
        };
        
        res.json({
          tid,
          created_at: new Date().toISOString(),
          next_redirect_pc_url: `${req.protocol}://${req.get('host')}/api/payments/kakaopay/mock-payment?tid=${tid}`,
          next_redirect_mobile_url: `${req.protocol}://${req.get('host')}/api/payments/kakaopay/mock-payment?tid=${tid}`,
          android_app_scheme: "intent://kakaopay/pg",
          ios_app_scheme: "kakaotalk://kakaopay/pg",
          payment_ready: true,
          simulation_mode: true,
          fallback_reason: apiError instanceof Error ? apiError.message : 'Unknown error'
        });
      }
    } catch (error) {
      console.error("카카오페이 결제 준비 오류:", error);
      res.status(500).json({ error: "결제 준비 중 오류가 발생했습니다." });
    }
  });

  // 모의 카카오페이 결제창 페이지
  app.get("/api/payments/kakaopay/mock-payment", async (req, res) => {
    const { tid } = req.query;
    const paymentInfo = (global as any).tempPayments?.[tid as string];
    
    if (!paymentInfo) {
      return res.status(404).send('결제 정보를 찾을 수 없습니다.');
    }
    
    // 실제 카카오페이와 유사한 결제창 HTML
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>카카오페이 결제</title>
        <style>
          body { 
            margin: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #fee500;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .payment-container {
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .kakao-logo {
            width: 80px;
            height: 80px;
            background: #fee500;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
          }
          .amount {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin: 20px 0;
          }
          .item-name {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
          }
          .btn {
            width: 100%;
            padding: 16px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin: 8px 0;
          }
          .btn-pay {
            background: #fee500;
            color: #3c1e1e;
          }
          .btn-cancel {
            background: #f5f5f5;
            color: #666;
          }
          .processing {
            display: none;
            color: #666;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="payment-container">
          <div class="kakao-logo">K</div>
          <h2>카카오페이 결제</h2>
          <div class="amount">${paymentInfo.amount.toLocaleString()}원</div>
          <div class="item-name">${paymentInfo.item_name}</div>
          
          <div id="payment-form">
            <button class="btn btn-pay" onclick="processPayment()">
              결제하기
            </button>
            <button class="btn btn-cancel" onclick="cancelPayment()">
              취소
            </button>
          </div>
          
          <div id="processing" class="processing">
            결제를 처리하고 있습니다...
          </div>
        </div>
        
        <script>
          function processPayment() {
            document.getElementById('payment-form').style.display = 'none';
            document.getElementById('processing').style.display = 'block';
            
            // 2초 후 결제 완료 처리
            setTimeout(() => {
              fetch('/api/payments/kakaopay/complete/${tid}', { method: 'POST' })
                .then(() => {
                  window.close();
                });
            }, 2000);
          }
          
          function cancelPayment() {
            fetch('/api/payments/kakaopay/cancel-payment/${tid}', { method: 'POST' })
              .then(() => {
                window.close();
              });
          }
        </script>
      </body>
      </html>
    `);
  });

  // 결제 완료 처리
  app.post("/api/payments/kakaopay/complete/:tid", async (req, res) => {
    const { tid } = req.params;
    const paymentInfo = (global as any).tempPayments?.[tid];
    
    if (paymentInfo) {
      // 90% 확률로 성공
      const isSuccess = Math.random() > 0.1;
      paymentInfo.status = isSuccess ? 'SUCCESS' : 'FAILED';
      paymentInfo.completed_at = new Date().toISOString();
    }
    
    res.json({ success: true });
  });

  // 결제 취소 처리
  app.post("/api/payments/kakaopay/cancel-payment/:tid", async (req, res) => {
    const { tid } = req.params;
    const paymentInfo = (global as any).tempPayments?.[tid];
    
    if (paymentInfo) {
      paymentInfo.status = 'CANCELLED';
      paymentInfo.cancelled_at = new Date().toISOString();
    }
    
    res.json({ success: true });
  });

  // 카카오페이 결제 상태 확인 API
  app.get("/api/payments/kakaopay/status/:tid", async (req, res) => {
    try {
      const { tid } = req.params;
      const paymentInfo = (global as any).tempPayments?.[tid];
      
      if (!paymentInfo) {
        return res.json({
          status: "failed",
          message: "결제 정보를 찾을 수 없습니다.",
          tid
        });
      }
      
      if (paymentInfo.status === 'SUCCESS') {
        res.json({
          status: "success",
          message: "결제가 완료되었습니다.",
          tid,
          amount: paymentInfo.amount,
          credits: paymentInfo.credits,
          simulation_mode: true
        });
      } else if (paymentInfo.status === 'FAILED') {
        res.json({
          status: "failed",
          message: "결제가 실패했습니다.",
          tid,
          simulation_mode: true
        });
      } else if (paymentInfo.status === 'CANCELLED') {
        res.json({
          status: "failed",
          message: "결제가 취소되었습니다.",
          tid,
          simulation_mode: true
        });
      } else {
        res.json({
          status: "pending",
          message: "결제 대기 중입니다.",
          tid,
          simulation_mode: true
        });
      }
    } catch (error) {
      console.error("결제 상태 확인 오류:", error);
      res.status(500).json({ error: "결제 상태 확인 중 오류가 발생했습니다." });
    }
  });

  // 카카오페이 결제 승인 콜백
  app.get("/api/payments/kakaopay/success", async (req, res) => {
    try {
      const { pg_token, tid } = req.query;
      
      if (!pg_token || !tid) {
        return res.redirect("/?payment=error&reason=missing_params");
      }

      console.log(`카카오페이 결제 승인 처리: tid=${tid}, pg_token=${pg_token}`);

      try {
        // 실제 카카오페이 승인 API 호출
        const approveResponse = await fetch('https://kapi.kakao.com/v1/payment/approve', {
          method: 'POST',
          headers: {
            'Authorization': `KakaoAK ${process.env.KAKAO_PAY_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
          },
          body: new URLSearchParams({
            cid: process.env.KAKAO_PAY_CID || "TC0ONETIME",
            tid: tid as string,
            partner_order_id: (global as any).tempPayments?.[tid as string]?.orderId || 'unknown',
            partner_user_id: "current-user",
            pg_token: pg_token as string
          }).toString()
        });

        if (!approveResponse.ok) {
          const errorText = await approveResponse.text();
          console.error('카카오페이 승인 API 오류:', errorText);
          throw new Error(`승인 API 호출 실패: ${approveResponse.status}`);
        }

        const approveData = await approveResponse.json();
        console.log('카카오페이 결제 승인 성공:', approveData);

        // 결제 완료 처리
        const paymentInfo = (global as any).tempPayments?.[tid as string];
        if (paymentInfo) {
          paymentInfo.status = 'SUCCESS';
          paymentInfo.approved_at = new Date().toISOString();
          paymentInfo.approve_data = approveData;
        }

        res.redirect("/?payment=success");
      } catch (apiError) {
        console.error('카카오페이 승인 API 호출 실패:', apiError);
        
        // API 실패 시 시뮬레이션 처리
        const paymentInfo = (global as any).tempPayments?.[tid as string];
        if (paymentInfo) {
          paymentInfo.status = 'SUCCESS';
          paymentInfo.approved_at = new Date().toISOString();
          paymentInfo.fallback_approval = true;
        }
        
        res.redirect("/?payment=success");
      }
    } catch (error) {
      console.error("결제 승인 처리 오류:", error);
      res.redirect("/?payment=error");
    }
  });

  app.get("/api/payments/kakaopay/cancel", async (req, res) => {
    res.redirect("/?payment=cancel");
  });

  app.get("/api/payments/kakaopay/fail", async (req, res) => {
    res.redirect("/?payment=fail");
  });

  // ========================================
  // 관리자 API 엔드포인트
  // ========================================

  // 관리자 사용자 목록
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const adminUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        credits: user.credits || 0,
        isActive: user.isActive !== false,
        registeredAt: user.registeredAt || new Date().toISOString(),
        lastLoginAt: user.lastLoginAt
      }));
      
      res.json(adminUsers);
    } catch (error) {
      console.error("관리자 사용자 목록 조회 실패:", error);
      res.status(500).json({ error: "사용자 목록 조회 실패" });
    }
  });

  // 관리자 결제 내역
  app.get("/api/admin/payments", async (req, res) => {
    try {
      // 임시 저장된 결제 내역 반환 (실제로는 데이터베이스에서 조회)
      const tempPayments = (global as any).tempPayments || {};
      const payments = Object.values(tempPayments).map((payment: any) => ({
        id: payment.tid,
        userId: "current-user",
        username: "테스트사용자",
        amount: payment.amount,
        credits: payment.credits,
        status: payment.status,
        paymentMethod: "카카오페이",
        tid: payment.tid,
        createdAt: payment.created_at
      }));
      
      res.json(payments);
    } catch (error) {
      console.error("관리자 결제 내역 조회 실패:", error);
      res.status(500).json({ error: "결제 내역 조회 실패" });
    }
  });

  // 관리자 통계
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const tempPayments = (global as any).tempPayments || {};
      const payments = Object.values(tempPayments);
      
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(user => user.isActive !== false).length,
        totalRevenue: payments.reduce((sum: number, payment: any) => 
          payment.status === 'SUCCESS' ? sum + payment.amount : sum, 0),
        totalCreditsIssued: payments.reduce((sum: number, payment: any) => 
          payment.status === 'SUCCESS' ? sum + payment.credits : sum, 0),
        pendingPayments: payments.filter((payment: any) => payment.status === 'READY').length
      };
      
      res.json(stats);
    } catch (error) {
      console.error("관리자 통계 조회 실패:", error);
      res.status(500).json({ error: "통계 조회 실패" });
    }
  });

  // 사용자 상태 변경
  app.patch("/api/admin/users/:userId/status", async (req, res) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });
      }
      
      await storage.updateUser(userId, { isActive });
      
      res.json({ success: true, message: "사용자 상태가 변경되었습니다" });
    } catch (error) {
      console.error("사용자 상태 변경 실패:", error);
      res.status(500).json({ error: "사용자 상태 변경 실패" });
    }
  });

  // 사용자에게 크레딧 지급
  app.post("/api/admin/users/:userId/credits", async (req, res) => {
    try {
      const { userId } = req.params;
      const { credits } = req.body;
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });
      }
      
      const newCredits = (user.credits || 0) + credits;
      await storage.updateUser(userId, { credits: newCredits });
      
      res.json({ 
        success: true, 
        message: `${credits} 크레딧이 지급되었습니다`,
        newTotal: newCredits
      });
    } catch (error) {
      console.error("크레딧 지급 실패:", error);
      res.status(500).json({ error: "크레딧 지급 실패" });
    }
  });

  // 관리자 모든 테이블 데이터 조회
  app.get("/api/admin/tables", async (req, res) => {
    try {
      const [users, matches, swipes, conversations, messages, phoneVerifications, userSessions] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllMatches(),
        storage.getAllSwipes(),
        storage.getAllConversations(),
        storage.getAllMessages(),
        storage.getAllPhoneVerifications(),
        storage.getAllUserSessions()
      ]);

      res.json({
        users: { count: users.length, data: users.slice(0, 10) }, // 처음 10개만 미리보기
        matches: { count: matches.length, data: matches.slice(0, 10) },
        swipes: { count: swipes.length, data: swipes.slice(0, 10) },
        conversations: { count: conversations.length, data: conversations.slice(0, 10) },
        messages: { count: messages.length, data: messages.slice(0, 10) },
        phoneVerifications: { count: phoneVerifications.length, data: phoneVerifications.slice(0, 10) },
        userSessions: { count: userSessions.length, data: userSessions.slice(0, 10) }
      });
    } catch (error) {
      console.error("테이블 데이터 조회 오류:", error);
      res.status(500).json({ error: "테이블 데이터 조회 실패" });
    }
  });

  // 데이터 내보내기
  app.get("/api/admin/export/:type", async (req, res) => {
    try {
      const { type } = req.params;
      
      if (type === 'users') {
        const users = await storage.getAllUsers();
        const csvHeader = "ID,사용자명,이메일,전화번호,크레딧,상태,가입일\n";
        const csvData = users.map(user => 
          `${user.id},${user.username},${user.email},${user.phone},${user.credits || 0},${user.isActive !== false ? '활성' : '비활성'},${user.registeredAt || new Date().toISOString()}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.send('\uFEFF' + csvHeader + csvData); // BOM for UTF-8
      } else if (type === 'payments') {
        const tempPayments = (global as any).tempPayments || {};
        const payments = Object.values(tempPayments);
        const csvHeader = "거래ID,금액,크레딧,상태,결제수단,생성일\n";
        const csvData = payments.map((payment: any) => 
          `${payment.tid},${payment.amount},${payment.credits},${payment.status},카카오페이,${payment.created_at}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
        res.send('\uFEFF' + csvHeader + csvData);
      } else {
        res.status(400).json({ error: "지원하지 않는 내보내기 타입입니다" });
      }
    } catch (error) {
      console.error("데이터 내보내기 실패:", error);
      res.status(500).json({ error: "데이터 내보내기 실패" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
