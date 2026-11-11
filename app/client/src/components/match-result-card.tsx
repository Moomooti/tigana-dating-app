import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Calendar, Users } from "lucide-react";

interface MatchResultCardProps {
  matchedUser: {
    id: string;
    name: string;
    age: number;
    gender: string;
    location: string;
    occupation: string;
    bio: string;
    photoUrl: string;
    keywords: string[];
  };
  onFavorite?: (userId: string) => void;
  onStartChat?: (userId: string) => void;
  isFavorited?: boolean;
}

export default function MatchResultCard({ 
  matchedUser, 
  onFavorite, 
  onStartChat,
  isFavorited = false 
}: MatchResultCardProps) {
  const [location, setLocation] = useLocation();

  const handleViewProfile = () => {
    setLocation(`/matched-profile/${matchedUser.id}`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(matchedUser.id);
  };

  const handleStartChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartChat?.(matchedUser.id);
  };

  const genderText = matchedUser.gender === 'female' ? '여성' : 
                    matchedUser.gender === 'male' ? '남성' : '기타';

  return (
    <Card 
      onClick={handleViewProfile}
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="relative">
        <img 
          src={matchedUser.photoUrl}
          alt={matchedUser.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleFavorite}
            className={`w-8 h-8 rounded-full bg-white/90 hover:bg-white ${
              isFavorited ? 'text-pink-500' : 'text-gray-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        {/* Match Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-pink-500 text-white text-xs">
            ✨ 매칭 완료
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-800 mb-1">{matchedUser.name}</h3>
          <div className="flex items-center text-sm text-gray-600 space-x-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{matchedUser.age}세</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{genderText}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{matchedUser.location}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {matchedUser.bio}
        </p>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1 mb-4">
          {matchedUser.keywords.slice(0, 3).map((keyword, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
          {matchedUser.keywords.length > 3 && (
            <Badge variant="outline" className="text-xs text-gray-500">
              +{matchedUser.keywords.length - 3}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFavorite}
            className={`flex-1 ${isFavorited ? 'border-pink-300 text-pink-600' : ''}`}
          >
            <Heart className={`w-4 h-4 mr-1 ${isFavorited ? 'fill-current' : ''}`} />
            찜하기
          </Button>
          
          <Button
            size="sm"
            onClick={handleStartChat}
            className="flex-1 pink-gradient text-white"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            채팅
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}