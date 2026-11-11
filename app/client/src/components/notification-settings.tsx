import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bell, Smartphone, Mail, MessageCircle, Heart, Save } from "lucide-react";

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  console.log("NotificationSettings 렌더링됨, isOpen:", isOpen);
  
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [favoriteNotifications, setFavoriteNotifications] = useState(true);
  const [roomNotifications, setRoomNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleSaveSettings = () => {
    // 실제 구현에서는 API 호출
    alert("알림 설정이 저장되었습니다.");
    console.log("알림 설정 저장:", {
      pushNotifications,
      emailNotifications,
      matchNotifications,
      messageNotifications,
      favoriteNotifications,
      roomNotifications,
      soundEnabled,
      vibrationEnabled
    });
  };

  return (
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
            <DialogTitle>알림 설정</DialogTitle>
          </div>
          <DialogDescription>
            알림 수신 방식과 종류를 설정하세요
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* 기본 알림 설정 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Bell className="w-4 h-4 text-pink-500" />
                <span>기본 알림</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">푸시 알림</Label>
                  <p className="text-xs text-gray-500">앱 푸시 알림 수신</p>
                </div>
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">이메일 알림</Label>
                  <p className="text-xs text-gray-500">이메일로 알림 수신</p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">알림 소리</Label>
                  <p className="text-xs text-gray-500">알림 소리 재생</p>
                </div>
                <Switch 
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">진동</Label>
                  <p className="text-xs text-gray-500">알림 시 진동</p>
                </div>
                <Switch 
                  checked={vibrationEnabled}
                  onCheckedChange={setVibrationEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* 상세 알림 설정 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-pink-500" />
                <span>상세 알림</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">매칭 알림</Label>
                  <p className="text-xs text-gray-500">새로운 매칭 시 알림</p>
                </div>
                <Switch 
                  checked={matchNotifications}
                  onCheckedChange={setMatchNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">메시지 알림</Label>
                  <p className="text-xs text-gray-500">새로운 메시지 수신 시 알림</p>
                </div>
                <Switch 
                  checked={messageNotifications}
                  onCheckedChange={setMessageNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">찜하기 알림</Label>
                  <p className="text-xs text-gray-500">찜하기 받았을 때 알림</p>
                </div>
                <Switch 
                  checked={favoriteNotifications}
                  onCheckedChange={setFavoriteNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">채팅방 알림</Label>
                  <p className="text-xs text-gray-500">그룹 채팅방 메시지 알림</p>
                </div>
                <Switch 
                  checked={roomNotifications}
                  onCheckedChange={setRoomNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="pt-4">
            <Button
              onClick={handleSaveSettings}
              className="w-full pink-gradient text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              설정 저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}