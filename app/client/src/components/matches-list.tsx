import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Heart } from "lucide-react";
import type { Match, Conversation, User } from "@shared/schema";

interface MatchWithUser extends Match {
  otherUser: User;
}

interface ConversationWithUser extends Conversation {
  otherUser: User;
}

interface MatchesListProps {
  matches: MatchWithUser[];
  conversations: ConversationWithUser[];
  isLoading: boolean;
  onOpenChat: (conversation: ConversationWithUser) => void;
}

export default function MatchesList({ matches, conversations, isLoading, onOpenChat }: MatchesListProps) {
  if (isLoading) {
    return (
      <section className="px-4 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-20 pt-4 animate-fade-in">
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">매칭된 사람들</h2>
        <p className="text-sm text-muted-foreground">새로운 대화를 시작해보세요!</p>
      </div>

      {/* Recent Matches */}
      {matches.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">최근 매칭</h3>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {matches.slice(0, 5).map((match) => (
              <div key={match.id} className="flex-shrink-0 text-center">
                <img 
                  src={match.otherUser.mainPhotoUrl} 
                  alt={match.otherUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-pink-500" 
                />
                <p className="text-xs font-medium mt-1">{match.otherUser.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversations */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-foreground mb-3">대화</h3>
        
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">아직 대화가 없어요</h3>
              <p className="text-sm text-slate-600">매칭된 사람과 대화를 시작해보세요!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onOpenChat(conversation)}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src={conversation.isAvatarMode && !conversation.profilesRevealed ? 
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" : 
                          conversation.otherUser.mainPhotoUrl
                        } 
                        alt={conversation.isAvatarMode && !conversation.profilesRevealed ? "익명" : conversation.otherUser.name}
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                      {conversation.isAvatarMode && !conversation.profilesRevealed && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">?</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-slate-800">
                            {conversation.isAvatarMode && !conversation.profilesRevealed ? "익명" : conversation.otherUser.name}
                          </h4>
                          {conversation.isAvatarMode && !conversation.profilesRevealed && (
                            <span className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full">익명</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {conversation.lastMessageTime ? 
                            new Date(conversation.lastMessageTime).toLocaleDateString() : 
                            "새 매칭"
                          }
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">
                        {conversation.lastMessage || "대화를 시작해보세요!"}
                      </p>
                    </div>
                    {!conversation.lastMessage && (
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {matches.length === 0 && conversations.length === 0 && (
        <Card className="mx-4">
          <CardContent className="py-12 text-center">
            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">아직 매칭이 없어요</h3>
            <p className="text-sm text-slate-600">발견 탭에서 새로운 사람들을 만나보세요!</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
