import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Code, User, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DeveloperLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, sessionId: string) => void;
}

export default function DeveloperLogin({ isOpen, onClose, onSuccess }: DeveloperLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/developer-login", {
        email,
        password
      });
      
      if (response.ok) {
        const userData = await response.json();
        toast({
          title: "로그인 성공",
          description: `환영합니다, ${userData.user.name}님!`,
        });
        onSuccess(userData.user, userData.sessionId);
        onClose();
        setEmail("");
        setPassword("");
      } else {
        const error = await response.json();
        toast({
          title: "로그인 실패",
          description: error.message || "로그인에 실패했습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Developer login error:", error);
      toast({
        title: "로그인 실패",
        description: "서버 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Code className="w-5 h-5 text-blue-600" />
            개발자 로그인
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dev-email">이메일</Label>
              <Input
                id="dev-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="개발자 이메일을 입력하세요"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dev-password">비밀번호</Label>
              <Input
                id="dev-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    로그인 중...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    로그인
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}