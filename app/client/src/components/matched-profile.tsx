import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Briefcase, Heart, MessageCircle, Phone, Calendar, Users } from "lucide-react";
import ProfilePhotosSlider from "@/components/profile-photos-slider";

interface MatchedProfileProps {
  matchedUser: {
    id: string;
    name: string;
    age: number;
    gender: string;
    bio: string;
    location: string;
    occupation: string;
    photos: string[];
    keywords: string[];
  };
  onBack: () => void;
  onStartChat: () => void;
  onAddToFavorites: () => void;
  isFavorited?: boolean;
}

export default function MatchedProfile({ 
  matchedUser, 
  onBack, 
  onStartChat, 
  onAddToFavorites,
  isFavorited = false 
}: MatchedProfileProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const genderText = matchedUser.gender === 'female' ? '여성' : 
                    matchedUser.gender === 'male' ? '남성' : '기타';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">매칭 프로필</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddToFavorites}
            className={`h-10 w-10 ${isFavorited ? 'text-pink-500' : 'text-gray-400'}`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="pb-24">
        {/* Profile Photos */}
        <div className="relative">
          <ProfilePhotosSlider 
            photos={matchedUser.photos}
            isEditable={false}
          />
          
          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
            <h2 className="text-2xl font-bold mb-1">{matchedUser.name}</h2>
            <div className="flex items-center space-x-2 text-sm opacity-90 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{matchedUser.age}세</span>
              <Users className="w-4 h-4 ml-2" />
              <span>{genderText}</span>
              <MapPin className="w-4 h-4 ml-2" />
              <span>{matchedUser.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm opacity-75">
              <Briefcase className="w-4 h-4" />
              <span>{matchedUser.occupation}</span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="px-4 py-6 space-y-6">
          {/* Bio */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2 text-pink-500" />
                자기소개
              </h3>
              <p className="text-gray-700 leading-relaxed">{matchedUser.bio}</p>
            </CardContent>
          </Card>

          {/* Keywords/Interests */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Heart className="w-4 h-4 mr-2 text-pink-500" />
                관심사
              </h3>
              <div className="flex flex-wrap gap-2">
                {matchedUser.keywords.map((keyword, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="bg-pink-50 text-pink-700 hover:bg-pink-100"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">기본 정보</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>나이</span>
                  </div>
                  <span className="font-medium">{matchedUser.age}세</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>성별</span>
                  </div>
                  <span className="font-medium">{genderText}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>지역</span>
                  </div>
                  <span className="font-medium">{matchedUser.location}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>직업</span>
                  </div>
                  <span className="font-medium">{matchedUser.occupation}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matching Info */}
          <Card className="bg-pink-50 border-pink-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-pink-500 fill-current" />
                </div>
                <h3 className="font-semibold text-pink-800 mb-1">매칭 완료!</h3>
                <p className="text-sm text-pink-600">
                  프라이빗 룸에서 서로 마음이 통해 매칭되었습니다
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3 max-w-md mx-auto">
          <Button
            variant="outline"
            onClick={onAddToFavorites}
            className={`flex-1 ${isFavorited ? 'border-pink-300 text-pink-600' : ''}`}
          >
            <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
            {isFavorited ? '찜하기 완료' : '찜하기'}
          </Button>
          
          <Button
            onClick={onStartChat}
            className="flex-1 pink-gradient text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            채팅 시작
          </Button>
        </div>
      </div>
    </div>
  );
}