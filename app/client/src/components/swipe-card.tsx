import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Star, MapPin, Briefcase, ChevronLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

// 러브커넥트 하트 아이콘 컴포넌트
const LoveConnectHeart = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

interface SwipeCardProps {
  users: User[];
  currentUserId: string;
  onMatch: (user: User) => void;
}

export default function SwipeCard({ users, currentUserId, onMatch }: SwipeCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<{
    url: string;
    title: string;
    type: 'main' | 'best' | 'movie' | 'place' | 'free';
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const swipeMutation = useMutation({
    mutationFn: async ({ targetUserId, liked }: { targetUserId: string; liked: boolean }) => {
      const response = await apiRequest("POST", "/api/swipes", {
        userId: currentUserId,
        targetUserId,
        liked,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.match) {
        const matchedUser = users.find(user => 
          user.id === data.swipe.targetUserId
        );
        if (matchedUser) {
          onMatch(matchedUser);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "potential-matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "matches"] });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleSwipe = async (liked: boolean, direction: "left" | "right" | "up") => {
    if (isAnimating || currentIndex >= users.length) return;

    const currentUser = users[currentIndex];
    setIsAnimating(true);

    // Immediately update to next card without animation delay
    swipeMutation.mutate({
      targetUserId: currentUser.id,
      liked,
    });
    
    setCurrentIndex(prev => prev + 1);
    setIsAnimating(false);
  };

  const handleLike = () => handleSwipe(true, "right");
  const handleDislike = () => handleSwipe(false, "left");
  const handleSuperLike = () => handleSwipe(true, "up");

  const handlePhotoClick = (url: string, title: string, type: 'main' | 'best' | 'movie' | 'place' | 'free') => {
    setViewingPhoto({ url, title, type });
  };

  const closePhotoView = () => {
    setViewingPhoto(null);
  };

  if (currentIndex >= users.length) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <div className="text-center p-6">
          <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">모든 프로필을 확인했어요!</h3>
          <p className="text-sm text-slate-600">새로운 사용자가 등록되면 알려드릴게요.</p>
        </div>
      </Card>
    );
  }

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];
  const thirdUser = users[currentIndex + 2];

  if (!currentUser) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-sm text-slate-600">프로필을 불러오는 중...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Card Stack */}
      <div className="relative w-full h-full">
        {/* Third Card (Bottom) */}
        {thirdUser && (
          <Card className="absolute inset-0 swipe-card overflow-hidden bg-white"
                style={{ 
                  zIndex: 1, 
                  transform: "scale(0.92)", 
                  top: "16px" 
                }}>
            <div className="mt-8 mx-4 mb-4">
              <div className="relative grid grid-cols-2 gap-4" style={{ height: "240px" }}>
                <div className="bg-pink-50 rounded-lg"></div>
                <div className="bg-pink-50 rounded-lg"></div>
                <div className="bg-pink-50 rounded-lg"></div>
                <div className="bg-pink-50 rounded-lg"></div>
                {/* Center Profile */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-16 h-16 rounded-full border-3 border-white shadow-lg overflow-hidden">
                    <img
                      src={thirdUser.mainPhotoUrl}
                      alt={thirdUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
              <h3 className="text-lg font-bold text-card-foreground">{thirdUser.name}</h3>
              <p className="text-sm text-muted-foreground">{thirdUser.age}세</p>
            </div>
          </Card>
        )}

        {/* Second Card (Middle) */}
        {nextUser && (
          <Card className="absolute inset-0 swipe-card overflow-hidden bg-white"
                style={{ 
                  zIndex: 2, 
                  transform: "scale(0.96)", 
                  top: "8px" 
                }}>
            <div className="mt-8 mx-4 mb-4">
              <div className="relative grid grid-cols-2 gap-4" style={{ height: "240px" }}>
                <div className="bg-pink-50 rounded-lg"></div>
                <div className="bg-pink-50 rounded-lg"></div>
                <div className="bg-pink-50 rounded-lg"></div>
                <div className="bg-pink-50 rounded-lg"></div>
                {/* Center Profile */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-18 h-18 rounded-full border-3 border-white shadow-lg overflow-hidden">
                    <img
                      src={nextUser.mainPhotoUrl}
                      alt={nextUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
              <h3 className="text-lg font-bold text-card-foreground">{nextUser.name}</h3>
              <p className="text-sm text-muted-foreground">{nextUser.age}세</p>
            </div>
          </Card>
        )}

        {/* Top Card (Active) */}
        <Card className="absolute inset-0 swipe-card active overflow-hidden bg-white"
              style={{ zIndex: 3 }}>

          {/* Four-part Grid with Center Profile */}
          <div className="p-4 pt-8">
            <div className="relative grid grid-cols-2 gap-2" style={{ height: "300px" }}>
              {/* Grid 1: Best Keyword */}
              <div 
                className="relative rounded-xl overflow-hidden shadow-md cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center"
                onClick={() => handlePhotoClick('', currentUser.bestKeyword, "best")}
              >
                <div className="text-center p-4">
                  <span className="text-pink-800 text-lg font-bold">{currentUser?.bestKeyword || "키워드"}</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-white/80 backdrop-blur-sm rounded-lg p-1">
                  <span className="text-pink-700 text-xs font-semibold">Best</span>
                </div>
              </div>

              {/* Grid 2: Favorite Movie */}
              <div 
                className="relative rounded-xl overflow-hidden shadow-md cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center"
                onClick={() => handlePhotoClick('', currentUser.favoriteMovieTitle, "movie")}
              >
                <div className="text-center p-4">
                  <span className="text-purple-800 text-lg font-bold">{currentUser?.favoriteMovieTitle || "영화"}</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-white/80 backdrop-blur-sm rounded-lg p-1 text-right">
                  <span className="text-purple-700 text-xs font-semibold">Movie</span>
                </div>
              </div>

              {/* Grid 3: Favorite Place */}
              <div 
                className="relative rounded-xl overflow-hidden shadow-md cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center"
                onClick={() => handlePhotoClick('', currentUser.favoritePlaceKeyword, "place")}
              >
                <div className="text-center p-4">
                  <span className="text-blue-800 text-lg font-bold">{currentUser?.favoritePlaceKeyword || "장소"}</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-white/80 backdrop-blur-sm rounded-lg p-1">
                  <span className="text-blue-700 text-xs font-semibold">Place</span>
                </div>
              </div>

              {/* Grid 4: Free Keyword */}
              <div 
                className="relative rounded-xl overflow-hidden shadow-md cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center"
                onClick={() => handlePhotoClick('', currentUser.freeKeyword, "free")}
              >
                <div className="text-center p-4">
                  <span className="text-green-800 text-lg font-bold">{currentUser?.freeKeyword || "취미"}</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-white/80 backdrop-blur-sm rounded-lg p-1 text-right">
                  <span className="text-green-700 text-xs font-semibold">Free</span>
                </div>
              </div>

              {/* Circular Profile Image - Center of Grid */}
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handlePhotoClick(currentUser.mainPhotoUrl, currentUser.name, "main")}
              >
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                  <img
                    src={currentUser.mainPhotoUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information - Below Grid */}
          <div className="mx-4 mb-6 p-4">
            <h3 className="text-2xl font-bold text-card-foreground mb-1">{currentUser.name}</h3>
            <p className="text-lg text-muted-foreground mb-3">{currentUser.age}세</p>
            <p className="text-sm text-card-foreground/80 mb-4 leading-relaxed">{currentUser.bio}</p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {currentUser.location}
              </span>
              <span className="flex items-center">
                <Briefcase className="w-3 h-3 mr-1" />
                {currentUser.occupation}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons - Positioned at bottom of container */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center items-center space-x-8 z-10">
        {/* Pass Button */}
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-3 border-pink-400 bg-pink-50 hover:bg-pink-100 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110"
          onClick={handleDislike}
          disabled={isAnimating || swipeMutation.isPending}
        >
          <X className="w-7 h-7 text-black" strokeWidth={2.5} />
        </Button>
        
        {/* Love Connect Heart Button */}
        <Button
          size="lg"
          className="w-20 h-20 rounded-full border-4 border-pink-400 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110 text-pink-600"
          onClick={handleLike}
          disabled={isAnimating || swipeMutation.isPending}
        >
          <LoveConnectHeart className="w-9 h-9" />
        </Button>
        
        {/* Super Like Button */}
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-3 border-pink-400 bg-pink-50 hover:bg-pink-100 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110"
          onClick={handleSuperLike}
          disabled={isAnimating || swipeMutation.isPending}
        >
          <Star className="w-7 h-7 text-black" strokeWidth={2.5} fill="currentColor" />
        </Button>
      </div>
      {/* Photo Viewer Modal */}
      {viewingPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full">
            {/* Close Button */}
            <button
              onClick={closePhotoView}
              className="absolute -top-12 left-0 text-white hover:text-pink-300 transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            {/* Content */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              {viewingPhoto.type === 'main' ? (
                <img
                  src={viewingPhoto.url}
                  alt={viewingPhoto.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className={`w-full h-96 flex items-center justify-center ${
                  viewingPhoto.type === 'best' ? 'bg-gradient-to-br from-pink-100 to-pink-200' :
                  viewingPhoto.type === 'movie' ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
                  viewingPhoto.type === 'place' ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
                  'bg-gradient-to-br from-green-100 to-green-200'
                }`}>
                  <span className={`text-3xl font-bold text-center p-6 ${
                    viewingPhoto.type === 'best' ? 'text-pink-800' :
                    viewingPhoto.type === 'movie' ? 'text-purple-800' :
                    viewingPhoto.type === 'place' ? 'text-blue-800' :
                    'text-green-800'
                  }`}>
                    {viewingPhoto.title}
                  </span>
                </div>
              )}
              
              {/* Content Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-card-foreground mb-1">
                  {viewingPhoto.type === 'main' && currentUser.name}
                  {viewingPhoto.type === 'best' && '가장 자신있는 점'}
                  {viewingPhoto.type === 'movie' && '좋아하는 영화'}
                  {viewingPhoto.type === 'place' && '자주 가는 곳'}
                  {viewingPhoto.type === 'free' && '취미/관심사'}
                </h3>
                {viewingPhoto.type === 'main' && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">{currentUser.age}세</p>
                    <p className="text-sm text-card-foreground/80">{currentUser.bio}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-muted-foreground flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {currentUser.location}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {currentUser.occupation}
                      </span>
                    </div>
                  </div>
                )}
                {viewingPhoto.type !== 'main' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {viewingPhoto.type === 'best' && `${currentUser.name}님이 가장 자신있어하는 특징입니다`}
                    {viewingPhoto.type === 'movie' && `${currentUser.name}님이 좋아하는 영화입니다`}
                    {viewingPhoto.type === 'place' && `${currentUser.name}님이 자주 가는 장소입니다`}
                    {viewingPhoto.type === 'free' && `${currentUser.name}님의 취미나 관심사입니다`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
