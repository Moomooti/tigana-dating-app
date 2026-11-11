import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Send, Clock, UserX, Heart } from "lucide-react";
import type { Conversation, Message, User } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface ChatProps {
  conversation: Conversation;
  otherUser: User;
  currentUserId: string;
  onBack: () => void;
}

export default function Chat({ conversation, otherUser, currentUserId, onBack }: ChatProps) {
  const [message, setMessage] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Calculate elapsed time since avatar mode started
  useEffect(() => {
    if (!conversation.isAvatarMode || !conversation.avatarModeStartTime) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(conversation.avatarModeStartTime!).getTime()) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [conversation.isAvatarMode, conversation.avatarModeStartTime]);

  // Fetch messages
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', conversation.id],
    enabled: !!conversation.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          senderId: currentUserId,
          content,
        }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setMessage("");
    },
  });

  // Reveal profiles mutation
  const revealProfilesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/conversations/${conversation.id}/reveal-profiles`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reveal profiles');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const canRevealProfiles = conversation.isAvatarMode && timeElapsed >= 30; // 30초로 변경 (테스트용)
  const displayName = conversation.isAvatarMode && !conversation.profilesRevealed ? "익명" : otherUser.name;
  const displayAvatar = conversation.isAvatarMode && !conversation.profilesRevealed ? 
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" : 
    otherUser.mainPhotoUrl;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <CardHeader className="flex-row items-center space-y-0 space-x-3 border-b border-gray-200 px-4 py-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center space-x-3 flex-1">
          <img
            src={displayAvatar}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800">{displayName}</h3>
            {conversation.isAvatarMode && !conversation.profilesRevealed && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs bg-pink-100" style={{ color: 'hsl(342, 45%, 68%)' }}>
                  <Clock className="w-3 h-3 mr-1" />
                  익명 모드
                </Badge>
                <span className="text-xs text-slate-500">
                  {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>

        {canRevealProfiles && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-pink-50 border-pink-200 hover:bg-pink-100" style={{ color: 'hsl(342, 45%, 68%)' }}>
                <Heart className="w-4 h-4 mr-1" />
                프로필 공개
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>프로필을 공개하시겠어요?</AlertDialogTitle>
                <AlertDialogDescription>
                  7분간의 익명 대화가 완료되었습니다. 서로의 실제 프로필을 공개하고 더 깊은 대화를 나눠보세요!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>나중에</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => revealProfilesMutation.mutate()}
                  className="text-white"
                  style={{ backgroundColor: 'hsl(342, 45%, 68%)' }}
                >
                  프로필 공개하기
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" style={{ color: 'hsl(342, 45%, 68%)' }} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">새로운 매칭이에요!</h3>
            <p className="text-sm text-slate-600 mb-4">
              {conversation.isAvatarMode ? 
                "7분간 익명으로 대화를 나눠보세요. 시간이 지나면 프로필을 공개할 수 있어요!" :
                "첫 메시지를 보내서 대화를 시작해보세요!"
              }
            </p>
          </div>
        ) : (
          messages.map((msg: Message) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  msg.senderId === currentUserId
                    ? 'chat-message-sent'
                    : 'chat-message-received'
                }`}
                style={{
                  backgroundColor: msg.senderId === currentUserId ? 'hsl(342, 60%, 85%)' : '#f3f4f6',
                  color: msg.senderId === currentUserId ? 'hsl(342, 80%, 25%)' : '#374151',
                  border: 'none'
                }}
              >
                {msg.messageType === 'system' ? (
                  <div className="text-center text-xs bg-pink-50 px-3 py-2 rounded-lg" style={{ color: 'hsl(342, 45%, 68%)' }}>
                    {msg.content}
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                <div className={`text-xs mt-1 ${
                  msg.senderId === currentUserId ? 'text-white opacity-75' : 'text-slate-500'
                }`}>
                  {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="chat-send-button hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}