import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { User } from "@shared/schema";

interface MatchModalProps {
  matchedUser: User;
  onClose: () => void;
  onStartChat: () => void;
}

export default function MatchModal({ matchedUser, onClose, onStartChat }: MatchModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm animate-slide-up">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <Heart className="w-16 h-16 text-pink-500 mx-auto animate-bounce-heart" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">매칭 성공!</h2>
          <p className="text-gray-600 mb-6">
            {matchedUser.name}님과 매칭되었습니다.<br />
            대화를 시작해보세요!
          </p>
          
          <div className="flex justify-center space-x-3 mb-6">
            <img 
              src="https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
              alt="나" 
              className="w-20 h-20 rounded-full object-cover border-3 border-pink-500" 
            />
            <img 
              src={matchedUser.photoUrl}
              alt={matchedUser.name} 
              className="w-20 h-20 rounded-full object-cover border-3 border-pink-500" 
            />
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full pink-gradient hover:shadow-lg transition-shadow"
              onClick={onStartChat}
            >
              메시지 보내기
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onClose}
            >
              나중에
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
