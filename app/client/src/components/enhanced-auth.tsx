import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, User, Mail, Lock, Smartphone, Heart, AlertCircle } from "lucide-react";
import { setSessionId } from "@/lib/auth";
import PhoneVerification from "./phone-verification";

interface EnhancedAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

type AuthMode = "login" | "signup" | "find";

export default function EnhancedAuth({ isOpen, onClose, onAuthSuccess }: EnhancedAuthProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 폼 상태
  const [loginData, setLoginData] = useState({
    identifier: "", // 전화번호 또는 이메일
    password: ""
  });

  // 회원가입 폼 상태
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: ""
  });

  // 찾기 폼 상태
  const [findData, setFindData] = useState({
    phone: "",
    email: ""
  });

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginData.identifier,
          password: loginData.password,
          rememberMe
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // 세션 ID 저장
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
        
        // 로그인 정보 저장 (remember me 체크시)
        if (rememberMe) {
          localStorage.setItem('savedLoginInfo', JSON.stringify({
            identifier: loginData.identifier,
            rememberMe: true
          }));
        }
        
        onAuthSuccess(data.user);
        onClose();
      } else {
        setError(data.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    
    if (!verifiedPhone) {
      setShowPhoneVerification(true);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (signupData.password.length < 6) {
      setError("비밀번호는 6자리 이상이어야 합니다.");
      return;
    }

    if (!signupData.name || !signupData.email || !signupData.age || !signupData.gender) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: verifiedPhone,
          email: signupData.email,
          password: signupData.password,
          name: signupData.name,
          age: parseInt(signupData.age),
          gender: signupData.gender,
          // 기본값들
          bio: "",
          location: "",
          occupation: "",
          mainPhotoUrl: "/default-avatar.png",
          bestKeyword: "",
          favoriteMovieTitle: "",
          favoritePlaceKeyword: "",
          freeKeyword: ""
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        if (data.message?.includes("이미 가입")) {
          setError("이미 가입되어 있습니다. 로그인을 해주세요.");
          setAuthMode("login");
          setLoginData({ identifier: verifiedPhone, password: "" });
        } else {
          setError(data.message || "회원가입에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFind = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/find-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(findData)
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`찾은 정보:\n전화번호: ${data.phone}\n이메일: ${data.email}`);
        setAuthMode("login");
        setLoginData({ identifier: data.phone, password: "" });
      } else {
        setError(data.message || "계정을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("Find account error:", error);
      setError("계정 찾기 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 저장된 로그인 정보 로드
  useState(() => {
    const saved = localStorage.getItem('savedLoginInfo');
    if (saved) {
      const { identifier, rememberMe: savedRememberMe } = JSON.parse(saved);
      setLoginData(prev => ({ ...prev, identifier }));
      setRememberMe(savedRememberMe);
    }
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span>
                {authMode === "login" && "로그인"}
                {authMode === "signup" && "회원가입"}
                {authMode === "find" && "계정 찾기"}
              </span>
            </DialogTitle>
            <DialogDescription>
              {authMode === "login" && "티가나에 로그인하세요"}
              {authMode === "signup" && "티가나에 가입하여 새로운 만남을 시작하세요"}
              {authMode === "find" && "가입했던 전화번호나 이메일로 계정을 찾으세요"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 로그인 모드 */}
            {authMode === "login" && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label>전화번호 또는 이메일</Label>
                    <Input
                      type="text"
                      value={loginData.identifier}
                      onChange={(e) => setLoginData(prev => ({ ...prev, identifier: e.target.value }))}
                      placeholder="010-1234-5678 또는 email@example.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>비밀번호</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="비밀번호를 입력하세요"
                        className="mt-1 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-1 h-9 w-9"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember" className="text-sm">로그인 정보 저장</Label>
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    onClick={handleLogin}
                    className="w-full pink-gradient text-white"
                    disabled={!loginData.identifier || !loginData.password || isLoading}
                  >
                    {isLoading ? "로그인 중..." : "로그인"}
                  </Button>

                  <div className="flex justify-center space-x-4 text-sm">
                    <Button variant="ghost" onClick={() => setAuthMode("signup")} className="p-0 text-pink-500">
                      회원가입
                    </Button>
                    <span className="text-gray-400">|</span>
                    <Button variant="ghost" onClick={() => setAuthMode("find")} className="p-0 text-pink-500">
                      계정 찾기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 회원가입 모드 */}
            {authMode === "signup" && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {!verifiedPhone ? (
                    <div className="text-center py-4">
                      <Smartphone className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">
                        회원가입을 위해 전화번호 인증이 필요합니다
                      </p>
                      <Button
                        onClick={() => setShowPhoneVerification(true)}
                        className="pink-gradient text-white"
                      >
                        전화번호 인증하기
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center py-2">
                        <div className="inline-flex items-center space-x-2 text-green-600 text-sm">
                          <Smartphone className="w-4 h-4" />
                          <span>{verifiedPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')} 인증완료</span>
                        </div>
                      </div>

                      <div>
                        <Label>이름</Label>
                        <Input
                          type="text"
                          value={signupData.name}
                          onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="이름을 입력하세요"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>이메일</Label>
                        <Input
                          type="email"
                          value={signupData.email}
                          onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>나이</Label>
                          <Select value={signupData.age} onValueChange={(value) => setSignupData(prev => ({ ...prev, age: value }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="나이" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 51 }, (_, i) => i + 20).map(age => (
                                <SelectItem key={age} value={age.toString()}>{age}세</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>성별</Label>
                          <Select value={signupData.gender} onValueChange={(value) => setSignupData(prev => ({ ...prev, gender: value }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="성별" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="여성">여성</SelectItem>
                              <SelectItem value="남성">남성</SelectItem>
                              <SelectItem value="기타">기타</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>비밀번호</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={signupData.password}
                            onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="6자리 이상 입력하세요"
                            className="mt-1 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-1 h-9 w-9"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>비밀번호 확인</Label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={signupData.confirmPassword}
                            onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="비밀번호를 다시 입력하세요"
                            className="mt-1 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-1 h-9 w-9"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-center space-x-2 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{error}</span>
                        </div>
                      )}

                      <Button
                        onClick={handleSignup}
                        className="w-full pink-gradient text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? "가입 중..." : "회원가입"}
                      </Button>
                    </>
                  )}

                  <div className="text-center">
                    <Button variant="ghost" onClick={() => setAuthMode("login")} className="text-pink-500">
                      이미 계정이 있으신가요? 로그인
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 계정 찾기 모드 */}
            {authMode === "find" && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label>전화번호</Label>
                    <Input
                      type="tel"
                      value={findData.phone}
                      onChange={(e) => setFindData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="010-1234-5678"
                      className="mt-1"
                    />
                  </div>

                  <div className="text-center text-sm text-gray-500">또는</div>

                  <div>
                    <Label>이메일</Label>
                    <Input
                      type="email"
                      value={findData.email}
                      onChange={(e) => setFindData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="mt-1"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    onClick={handleFind}
                    className="w-full pink-gradient text-white"
                    disabled={(!findData.phone && !findData.email) || isLoading}
                  >
                    {isLoading ? "찾는 중..." : "계정 찾기"}
                  </Button>

                  <div className="text-center">
                    <Button variant="ghost" onClick={() => setAuthMode("login")} className="text-pink-500">
                      로그인으로 돌아가기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 전화번호 인증 모달 */}
      <PhoneVerification
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        onVerified={(phone) => {
          setVerifiedPhone(phone);
          setShowPhoneVerification(false);
        }}
      />
    </>
  );
}