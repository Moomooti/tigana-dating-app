import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Mail, Lock, Bell, Shield, Trash2, Eye, EyeOff, Smartphone, LogOut } from "lucide-react";

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNotificationSettings?: () => void;
}

export default function AccountSettings({ isOpen, onClose, onOpenNotificationSettings }: AccountSettingsProps) {
  console.log("AccountSettings 렌더링됨, isOpen:", isOpen);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email] = useState("user@example.com");
  const [phoneNumber, setPhoneNumber] = useState("010-1234-5678");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (newPassword.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    // API call to change password
    alert("비밀번호가 변경되었습니다.");
    setShowPasswordChange(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePhoneUpdate = () => {
    // API call to update phone number
    alert("전화번호가 업데이트되었습니다.");
  };

  const handleDeleteAccount = () => {
    // API call to delete account
    alert("계정 탈퇴가 처리되었습니다.");
    setShowDeleteAccount(false);
  };

  const handleLogout = () => {
    // 실제 구현에서는 로그아웃 API 호출 및 토큰 삭제
    alert("로그아웃 되었습니다.");
    setShowLogoutConfirm(false);
    onClose();
    // 여기서 앱을 로그인 상태가 아닌 상태로 변경
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <DialogTitle>계정 설정</DialogTitle>
            </div>
            <DialogDescription>
              계정 정보와 보안 설정을 관리하세요
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* 계정 정보 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-pink-500" />
                  <span>계정 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500">이메일</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value={email} disabled className="bg-gray-50" />
                    <Button variant="outline" size="sm" disabled>
                      변경
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">이메일은 고객센터를 통해 변경 가능합니다</p>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">전화번호</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="010-0000-0000"
                    />
                    <Button variant="outline" size="sm" onClick={handlePhoneUpdate}>
                      <Smartphone className="w-3 h-3 mr-1" />
                      변경
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 보안 설정 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-pink-500" />
                  <span>보안 설정</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordChange(true)}
                  className="w-full justify-start"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  비밀번호 변경
                </Button>
              </CardContent>
            </Card>

            {/* 알림 설정 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-pink-500" />
                  <span>알림 설정</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log("계정 설정에서 알림 설정 클릭됨");
                    onClose();
                    if (onOpenNotificationSettings) {
                      onOpenNotificationSettings();
                    }
                  }}
                  className="w-full justify-start"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  상세 알림 설정
                </Button>
              </CardContent>
            </Card>

            {/* 계정 관리 */}
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2 text-red-600">
                  <Trash2 className="w-4 h-4" />
                  <span>계정 관리</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowDeleteAccount(true)}
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  계정 탈퇴
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* 비밀번호 변경 모달 */}
      <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
            <DialogDescription>
              보안을 위해 새로운 비밀번호를 설정해주세요
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <Label>현재 비밀번호</Label>
              <div className="relative mt-1">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호를 입력하세요"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label>새 비밀번호</Label>
              <div className="relative mt-1">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label>새 비밀번호 확인</Label>
              <div className="relative mt-1">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowPasswordChange(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={!currentPassword || !newPassword || !confirmPassword}
              className="flex-1 pink-gradient text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              변경
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 로그아웃 확인 모달 */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-orange-600">로그아웃 확인</DialogTitle>
            <DialogDescription>
              정말로 로그아웃 하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              로그아웃하면 다시 로그인해야 합니다.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleLogout}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                로그아웃
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 계정 탈퇴 확인 모달 */}
      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">계정 탈퇴</DialogTitle>
            <DialogDescription>
              정말로 계정을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>주의:</strong> 계정 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
              </p>
              <ul className="text-xs text-red-600 mt-2 space-y-1">
                <li>• 프로필 정보 및 사진</li>
                <li>• 매칭 기록 및 대화 내용</li>
                <li>• 사랑 크레딧 및 구매 내역</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteAccount(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleDeleteAccount}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              탈퇴하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}