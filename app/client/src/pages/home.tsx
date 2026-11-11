import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { User, Settings, Users, Info, ShoppingCart, MessageCircle, SkipForward, Send, Heart, Clock } from "lucide-react";
import EnhancedAuth from "@/components/enhanced-auth";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/user-profile";
import AccountSettings from "@/components/account-settings";
import NotificationSettings from "@/components/notification-settings";
import type { User as UserType } from "@shared/schema";

// Minimal user shape for this page
interface ConnectedUser {
	id: string;
	name: string;
	age: number;
	mainPhotoUrl?: string;
}

type Tab = "anonymous" | "profile" | "settings";

export default function Home() {
	const { user, setUser } = useAuth();
	const [activeTab, setActiveTab] = useState<Tab>("anonymous");
	const [loveCredits, setLoveCredits] = useState<number>(50);
	const [showCreditStore, setShowCreditStore] = useState<boolean>(false);
	const [isConnecting, setIsConnecting] = useState<boolean>(false);
	const [connectedUser, setConnectedUser] = useState<ConnectedUser | null>(null);
	const [connectionDuration, setConnectionDuration] = useState<number>(0);
	const [connectionTimer, setConnectionTimer] = useState<ReturnType<typeof setInterval> | null>(null);
	const [showConnectionEndModal, setShowConnectionEndModal] = useState<boolean>(false);
	const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; sender: "me" | "other"; timestamp: Date }>>([]);
	const [newMessage, setNewMessage] = useState<string>("");
	const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
	const [showAccountSettings, setShowAccountSettings] = useState<boolean>(false);
	const [showNotificationSettings, setShowNotificationSettings] = useState<boolean>(false);
	const [showFavoritesModal, setShowFavoritesModal] = useState<boolean>(false);
	const [favoriteUsers] = useState<UserType[]>([]);
	const [showSkipOptionsModal, setShowSkipOptionsModal] = useState<boolean>(false);
	const [skipReason, setSkipReason] = useState<string>("");

	const CURRENT_USER_ID = "current-user";

	useEffect(() => {
		return () => {
			if (connectionTimer) clearInterval(connectionTimer);
		};
	}, [connectionTimer]);

	const formatTime = (sec: number) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;
	const getProgress = () => Math.min(100, Math.floor((connectionDuration / 30) * 100)); // 30s demo

	const startConnecting = () => {
		setIsConnecting(true);
		setTimeout(() => {
			const pool: ConnectedUser[] = [
				{ id: "u1", name: "민트님", age: 25 },
				{ id: "u2", name: "소라님", age: 23 },
				{ id: "u3", name: "하늘님", age: 28 }
			];
			const picked = pool[Math.floor(Math.random() * pool.length)];
			setConnectedUser(picked);
			setIsConnecting(false);
			setConnectionDuration(0);
			const t = setInterval(() => {
				setConnectionDuration(prev => {
					const next = prev + 1;
					if (next >= 30) {
						clearInterval(t);
						setShowConnectionEndModal(true);
					}
					return next;
				});
			}, 1000);
			setConnectionTimer(t);
			setChatMessages([]);
			setNewMessage("");
		}, 1500);
	};

	const handleCategoryTap = () => {
		startConnecting();
	};

	const handleSendMessage = () => {
		if (!newMessage.trim()) return;
		setChatMessages(prev => [...prev, { id: `${Date.now()}`, text: newMessage.trim(), sender: "me", timestamp: new Date() }]);
		setNewMessage("");
	};

	const handleEndChat = () => {
		if (connectionTimer) clearInterval(connectionTimer);
		setConnectionTimer(null);
		setConnectedUser(null);
		setConnectionDuration(0);
		setShowConnectionEndModal(false);
		setChatMessages([]);
		setNewMessage("");
	};

	const handleSkipUser = async (reason?: string) => {
		const skippedId = connectedUser?.id;
		setConnectedUser(null);
		setChatMessages([]);
		setNewMessage("");
		setIsConnecting(true);
		try {
			if (skippedId) {
				await fetch("/api/connections/skip-credit", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ skipperId: CURRENT_USER_ID, skippedId, amount: 3, reason: reason || undefined })
				});
				setLoveCredits(prev => Math.max(0, prev - 3));
			}
		} catch (e) {
			console.error("Skip credit transfer failed", e);
		}
		setTimeout(() => startConnecting(), 800);
	};

	const categories = useMemo(
		() => [
			{ label: "영화", color: "hsl(342, 60%, 85%)" },
			{ label: "음악", color: "hsl(200, 60%, 90%)" },
			{ label: "나이", color: "hsl(45, 90%, 90%)" },
			{ label: "운동", color: "hsl(160, 60%, 90%)" },
			{ label: "연애", color: "hsl(300, 60%, 90%)" },
			{ label: "친구 먼저", color: "hsl(210, 60%, 92%)" },
			{ label: "고민", color: "hsl(0, 70%, 92%)" },
			{ label: "게임", color: "hsl(260, 60%, 90%)" },
			{ label: "만남", color: "hsl(20, 80%, 92%)" }
		],
		[]
	);

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<header className="px-4 py-3 border-b border-gray-200">
				<div className="max-w-md mx-auto flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
							<Heart className="w-5 h-5" style={{ color: "hsl(342, 45%, 68%)" }} />
						</div>
						<div>
							<h1 className="text-lg font-bold" style={{ color: "hsl(211, 45%, 35%)" }}>티가나</h1>
							<div className="text-xs font-semibold" style={{ color: "hsl(342, 45%, 68%)" }}>{loveCredits} 크레딧</div>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Button variant="ghost" size="sm" onClick={() => setShowCreditStore(true)} className="bg-white/90 hover:bg-white shadow-sm px-3 py-2" style={{ color: "hsl(342, 45%, 68%)" }}>
							<ShoppingCart className="w-5 h-5" />
						</Button>
						{!user ? (
							<Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)} className="border-pink-300 text-pink-600 hover:bg-pink-50">
								로그인
							</Button>
						) : (
							<Button variant="outline" size="sm" onClick={() => setActiveTab("profile")} className="border-pink-300 text-pink-600 hover:bg-pink-50">
								{user.name || "내 프로필"}
							</Button>
						)}
					</div>
				</div>
			</header>

			<main className="flex-1 pb-20">
				{activeTab === "anonymous" && !isConnecting && !connectedUser && (
					<section className="max-w-md mx-auto px-4 pt-4">
						<div className="mb-6 flex items-center justify-between">
							<div>
								<h2 className="text-xl font-bold mb-1" style={{ color: "hsl(211, 45%, 35%)" }}>프라이빗룸</h2>
								<p className="text-sm" style={{ color: "hsl(211, 25%, 55%)" }}>7분(데모 30초) 익명 채팅 후 선택</p>
							</div>
							<Button variant="outline" size="sm" className="border-pink-300 hover:bg-pink-50" style={{ color: "hsl(342, 45%, 68%)" }}>
								<Info className="w-4 h-4" />
							</Button>
						</div>

						<Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-pink-200 mb-6">
							<CardContent className="p-6 text-center">
								<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
									<Heart className="w-8 h-8 text-white" />
								</div>
								<h3 className="text-lg font-bold text-slate-800 mb-2">랜덤 커넥팅</h3>
								<p className="text-sm text-slate-600 mb-4">원하는 카테고리를 고르면 1:1로 연결돼요</p>
								<Button onClick={startConnecting} className="pink-gradient text-white hover:opacity-90 w-full">커넥팅 시작하기</Button>
							</CardContent>
						</Card>

						<div className="mb-3">
							<h3 className="text-lg font-semibold" style={{ color: "hsl(211, 45%, 35%)" }}>카테고리</h3>
							<p className="text-xs text-gray-500">탭하면 해당 주제로 랜덤 채팅이 시작됩니다</p>
						</div>
						<div className="grid grid-cols-3 gap-3">
							{categories.map(cat => (
								<Card key={cat.label} onClick={handleCategoryTap} className="cursor-pointer hover:scale-105 transition-transform border border-pink-100" style={{ backgroundColor: cat.color }}>
									<CardContent className="p-4 text-center">
										<h4 className="font-semibold text-sm" style={{ color: "hsl(211, 45%, 30%)" }}>{cat.label}</h4>
									</CardContent>
								</Card>
							))}
						</div>
					</section>
				)}

				{activeTab === "anonymous" && isConnecting && (
					<section className="max-w-md mx-auto px-4 py-20 text-center">
						<div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
							<Users className="w-12 h-12 text-white" />
						</div>
						<h3 className="text-xl font-bold text-foreground mb-2">상대를 찾는 중...</h3>
						<p className="text-sm text-muted-foreground">잠시만 기다려주세요</p>
					</section>
				)}

				{activeTab === "anonymous" && connectedUser && (
					<section className="flex flex-col h-full">
						<div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center space-x-3">
									<div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
										<Clock className="w-4 h-4 text-white" />
									</div>
									<div>
										<div className="text-lg font-bold text-purple-700">{formatTime(30 - connectionDuration)}</div>
										<div className="text-xs text-gray-600">남은 시간</div>
									</div>
								</div>
								<div className="text-right">
									<div className="text-sm font-medium text-gray-700">{formatTime(connectionDuration)} / 0:30</div>
									<div className="text-xs text-gray-500">진행 시간</div>
								</div>
							</div>
							<div className="w-full bg-white/50 rounded-full h-2 mb-2 shadow-inner">
								<div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${getProgress()}%` }}></div>
							</div>
						</div>

						<div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50 min-h-0" style={{ minHeight: "60vh" }}>
							{chatMessages.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-full">
									<div className="text-center py-1 mb-2">
										<p className="text-xs text-gray-500 font-medium">연결되었습니다</p>
									</div>
									<p className="text-xs text-gray-500">대화를 시작해보세요!</p>
								</div>
							) : (
								<>
									<div className="text-center py-1">
										<p className="text-xs text-gray-500 font-medium">연결되었습니다</p>
									</div>
									{chatMessages.map(m => (
										<div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
											<div className={`max-w-xs px-3 py-2 rounded-lg ${m.sender === "me" ? "bg-pink-200 text-pink-900" : "bg-white text-gray-800 border"}`}>
												<p className="text-sm">{m.text}</p>
											</div>
										</div>
									))}
								</>
							)}
						</div>

						<div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
							<div className="flex justify-center space-x-3">
								<Button onClick={handleEndChat} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 text-sm font-medium shadow-sm">
									<MessageCircle className="w-4 h-4" />
									<span>채팅 종료</span>
								</Button>
								<Button onClick={() => setShowSkipOptionsModal(true)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full flex items-center space-x-2 text-sm font-medium shadow-sm">
									<SkipForward className="w-4 h-4" />
									<span>다음 상대</span>
								</Button>
							</div>
						</div>

						<div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
							<div className="flex space-x-3 items-center">
								<Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="메시지를 입력하세요..." className="flex-1 border-gray-300 h-10 text-sm rounded-full px-4 focus:ring-2 focus:ring-pink-200 focus:border-pink-400" onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }} />
								<Button onClick={handleSendMessage} className="bg-pink-500 hover:bg-pink-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm" disabled={!newMessage.trim()}>
									<Send className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</section>
				)}

				{activeTab === "profile" && (
					<section className="max-w-md mx-auto px-0 py-0">
						<UserProfile 
							userId={user?.id || CURRENT_USER_ID} 
							favoriteUsers={favoriteUsers} 
							setShowFavoritesModal={setShowFavoritesModal} 
						/>
					</section>
				)}

				{activeTab === "settings" && (
					<section className="max-w-md mx-auto px-4 py-6">
						<h2 className="text-xl font-bold text-slate-800 mb-6">설정</h2>
						<Card className="mb-3">
							<CardContent className="p-4">
								<div className="text-sm text-gray-700">카카오페이 연동 테스트 중입니다. 실제 결제는 이루어지지 않습니다.</div>
							</CardContent>
						</Card>

						<div className="space-y-3">
							<Card className="hover:shadow-sm cursor-pointer" onClick={() => setShowAccountSettings(true)}>
								<CardContent className="p-4 flex items-center justify-between">
									<span className="font-medium">계정 설정</span>
									<span className="text-slate-400">›</span>
								</CardContent>
							</Card>
							<Card className="hover:shadow-sm cursor-pointer" onClick={() => setShowNotificationSettings(true)}>
								<CardContent className="p-4 flex items-center justify-between">
									<span className="font-medium">알림 설정</span>
									<span className="text-slate-400">›</span>
								</CardContent>
							</Card>
						</div>
					</section>
				)}
			</main>

			<nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md border-t px-4 py-3 z-40 shadow-lg" style={{ backgroundColor: "hsl(342, 30%, 96%)", borderColor: "hsl(342, 30%, 90%)" }}>
				<div className="flex justify-around items-center">
					<button onClick={() => setActiveTab("profile")} className={`flex flex-col items-center text-xs ${activeTab === "profile" ? "text-pink-600" : "text-gray-600"}`}>
						<User className="w-5 h-5" />
						<span>프로필</span>
					</button>
					<button onClick={() => setActiveTab("anonymous")} className={`flex flex-col items-center text-xs ${activeTab === "anonymous" ? "text-pink-600" : "text-gray-600"}`}>
						<Users className="w-5 h-5" />
						<span>프라이빗룸</span>
					</button>
					<button onClick={() => setActiveTab("settings")} className={`flex flex-col items-center text-xs ${activeTab === "settings" ? "text-pink-600" : "text-gray-600"}`}>
						<Settings className="w-5 h-5" />
						<span>설정</span>
					</button>
				</div>
			</nav>

			<Dialog open={showCreditStore} onOpenChange={setShowCreditStore}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-center text-xl font-bold text-pink-600">사랑 크레딧 충전</DialogTitle>
						<DialogDescription className="text-center">더 많은 대화를 즐기세요!<div className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 inline-block">카카오페이 연동 테스트 중입니다. 실제 결제는 이루어지지 않습니다.</div></DialogDescription>
					</DialogHeader>
					<div className="py-4 space-y-3">
						<Card>
							<CardContent className="p-4 flex items-center justify-between">
								<div>
									<div className="font-semibold">기본 패키지</div>
									<div className="text-sm text-muted-foreground">100 크레딧</div>
								</div>
								<Button onClick={() => setLoveCredits(prev => prev + 100)} className="pink-gradient text-white">테스트 충전</Button>
							</CardContent>
						</Card>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowCreditStore(false)}>닫기</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* 다음 상대 선택창 (3가지) */}
			<Dialog open={showSkipOptionsModal} onOpenChange={setShowSkipOptionsModal}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-center text-xl font-bold text-pink-600">다음 상대로 넘어가기</DialogTitle>
						<DialogDescription className="text-center">이유를 선택해주세요</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<Button onClick={() => { setSkipReason("관심사 안 맞음"); setShowSkipOptionsModal(false); handleSkipUser("관심사 안 맞음"); }} className="w-full bg-gray-700 hover:bg-gray-800 text-white">관심사 안 맞음</Button>
						<Button onClick={() => { setSkipReason("대화가 어려움"); setShowSkipOptionsModal(false); handleSkipUser("대화가 어려움"); }} className="w-full bg-gray-700 hover:bg-gray-800 text-white">대화가 어려움</Button>
						<Button onClick={() => { setSkipReason("그냥 다음"); setShowSkipOptionsModal(false); handleSkipUser("그냥 다음"); }} variant="outline" className="w-full">그냥 다음</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={showConnectionEndModal} onOpenChange={setShowConnectionEndModal}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-center text-xl font-bold text-pink-600">7분 종료 (데모 30초)</DialogTitle>
						<DialogDescription className="text-center">다음 중 하나를 선택하세요</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<Button onClick={() => { if (loveCredits >= 5) { setLoveCredits(prev => prev - 5); setShowConnectionEndModal(false); setConnectionDuration(0); const t = setInterval(() => setConnectionDuration(prev => { const n = prev + 1; if (n >= 30) { clearInterval(t); setShowConnectionEndModal(true); } return n; }), 1000); setConnectionTimer(t); } }} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">30초 더 연장하기 (-5)</Button>
						<Button onClick={() => { setShowConnectionEndModal(false); /* 찜하기는 데모에서 즉시 종료 후 프로필 공개 대신 유지 */ }} className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white">이 사람 찜하기</Button>
						<Button onClick={() => { setShowConnectionEndModal(false); setShowSkipOptionsModal(true); }} variant="outline" className="w-full">다음 사람 찾기</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* 즐겨찾기 모달 (간단 프리뷰) */}
			<Dialog open={showFavoritesModal} onOpenChange={setShowFavoritesModal}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-center text-xl font-bold text-pink-600">즐겨찾기</DialogTitle>
						<DialogDescription className="text-center">저장된 즐겨찾기 목록</DialogDescription>
					</DialogHeader>
					<div className="text-sm text-gray-600">
						{favoriteUsers.length === 0 ? "아직 즐겨찾기가 없습니다." : `${favoriteUsers.length}명이 있습니다.`}
					</div>
				</DialogContent>
			</Dialog>

			{/* 인증 모달 */}
			<EnhancedAuth 
				isOpen={showAuthModal} 
				onClose={() => setShowAuthModal(false)} 
				onAuthSuccess={(u) => { setUser(u); }} 
			/>

			{/* 설정 모달들 */}
			<AccountSettings 
				isOpen={showAccountSettings} 
				onClose={() => setShowAccountSettings(false)} 
				onOpenNotificationSettings={() => setShowNotificationSettings(true)} 
			/>
			<NotificationSettings 
				isOpen={showNotificationSettings} 
				onClose={() => setShowNotificationSettings(false)} 
			/>
		</div>
	);
}