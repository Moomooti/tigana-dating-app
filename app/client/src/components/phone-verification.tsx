import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Smartphone, Clock, CheckCircle } from "lucide-react";

interface PhoneVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (phone: string) => void;
  phone?: string;
}

export default function PhoneVerification({ isOpen, onClose, onVerified, phone: initialPhone = "" }: PhoneVerificationProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCodeSent && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isCodeSent, timeLeft]);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.length <= 13) { // 010-1234-5678 format
      setPhone(formatted);
    }
  };

  const sendVerificationCode = async () => {
    setError("");
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length !== 11) {
      setError("올바른 전화번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsCodeSent(true);
        setTimeLeft(60);
        console.log("인증코드 전송됨:", data.code); // 개발용 - 실제로는 SMS로 전송
      } else {
        setError(data.message || "인증코드 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      setError("인증코드 전송 중 오류가 발생했습니다.");
    }
  };

  const verifyCode = async () => {
    setError("");
    setIsVerifying(true);
    
    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, code: verificationCode })
      });

      const data = await response.json();
      
      if (response.ok) {
        onVerified(cleanPhone);
        onClose();
      } else {
        setError(data.message || "인증에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setError("인증 중 오류가 발생했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resendCode = () => {
    setTimeLeft(60);
    sendVerificationCode();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-pink-500" />
            <span>전화번호 인증</span>
          </DialogTitle>
          <DialogDescription>
            본인 확인을 위해 전화번호 인증이 필요합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isCodeSent ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">전화번호 입력</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>전화번호</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="010-1234-5678"
                    className="mt-1"
                  />
                </div>
                
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                  onClick={sendVerificationCode}
                  className="w-full pink-gradient text-white"
                  disabled={phone.length < 13}
                >
                  인증코드 받기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>인증코드 입력</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{phone}</span>로 인증코드를 전송했습니다.
                </div>

                <div>
                  <Label>인증코드 (6자리)</Label>
                  <Input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="mt-1 text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                  
                  {timeLeft === 0 ? (
                    <Button variant="ghost" onClick={resendCode} className="text-pink-500 p-0">
                      재전송
                    </Button>
                  ) : (
                    <span className="text-gray-400">재전송 가능</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={verifyCode}
                    className="w-full pink-gradient text-white"
                    disabled={verificationCode.length !== 6 || isVerifying}
                  >
                    {isVerifying ? "인증 중..." : "인증 완료"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCodeSent(false);
                      setVerificationCode("");
                      setError("");
                    }}
                    className="w-full"
                  >
                    전화번호 다시 입력
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}