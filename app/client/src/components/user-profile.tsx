import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Edit, Images, Sliders, User, Star } from "lucide-react";
import type { User as UserType } from "@shared/schema";
import ProfilePhotosSlider from "@/components/profile-photos-slider";
import ProfileEdit from "@/components/profile-edit";
import InterestsManagement from "@/components/interests-management";

interface UserProfileStats {
  likes: number;
  matches: number;
  views: number;
}

interface UserProfileProps {
  userId: string;
  favoriteUsers: UserType[];
  setShowFavoritesModal: (show: boolean) => void;
}

export default function UserProfile({ userId, favoriteUsers, setShowFavoritesModal }: UserProfileProps) {
  const [showPhotoManager, setShowPhotoManager] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showInterestsManager, setShowInterestsManager] = useState(false);
  const [profilePhotos, setProfilePhotos] = useState([
    "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
    "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
  ]);
  
  const [userProfile, setUserProfile] = useState({
    name: "김민지",
    age: 25,
    gender: "female",
    bio: "디자인과 커피를 사랑하는 크리에이터 ✨☕",
    location: "강남구",
    occupation: "디자이너"
  });

  const [userKeywords, setUserKeywords] = useState([
    "디자인", "카페투어", "영화감상", "여행", "유머감각", "창의적"
  ]);

  // Mock current user data - in a real app this would come from the API
  const currentUser = {
    id: userId,
    ...userProfile,
    photoUrl: profilePhotos[0] || "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    profilePhotos: profilePhotos,
    createdAt: new Date()
  };

  const handleProfileSave = (updatedProfile: any) => {
    setUserProfile(updatedProfile);
  };

  const handleKeywordsSave = (keywords: string[]) => {
    setUserKeywords(keywords);
  };

  // Mock stats - in a real app this would come from the API
  const stats: UserProfileStats = {
    likes: 124,
    matches: 18,
    views: 89
  };

  return (
    <section className="pb-20 pt-4 animate-fade-in">
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">내 프로필</h2>
        <p className="text-sm text-slate-600">매력적인 프로필로 더 많은 매칭을 받아보세요</p>
      </div>

      {/* Profile Preview */}
      <div className="mx-4 mb-6">
        <div className="relative">
          <ProfilePhotosSlider 
            photos={profilePhotos}
            isEditable={false}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white pointer-events-none rounded-b-lg">
            <h3 className="text-xl font-bold">{currentUser.name}</h3>
            <p className="text-sm opacity-90">
              {currentUser.age}세 • {currentUser.gender === 'female' ? '여성' : currentUser.gender === 'male' ? '남성' : '기타'} • {currentUser.location}
            </p>
            <p className="text-xs opacity-75 mt-1">{currentUser.bio}</p>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="mx-4 mb-6 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-500">{stats.views}</div>
            <div className="text-sm text-slate-600">프로필 조회</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-500">{stats.matches}</div>
            <div className="text-sm text-slate-600">매칭 수</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Edit Options */}
      <div className="px-4 space-y-3">
        <Card 
          onClick={() => setShowProfileEdit(true)}
          className="hover:shadow-md transition-shadow cursor-pointer"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Edit className="w-5 h-5 text-pink-500" />
                <span className="font-medium">프로필 정보 수정</span>
              </div>
              <span className="text-slate-400">›</span>
            </div>
          </CardContent>
        </Card>
        
        <Dialog open={showPhotoManager} onOpenChange={setShowPhotoManager}>
          <DialogTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Images className="w-5 h-5 text-pink-500" />
                    <span className="font-medium">사진 관리</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">{profilePhotos.length}/5</span>
                    <span className="text-slate-400">›</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>사진 관리</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ProfilePhotosSlider 
                photos={profilePhotos}
                isEditable={true}
                onPhotosChange={setProfilePhotos}
              />
              <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                <p className="text-sm text-pink-700">
                  💡 <strong>팁:</strong> 첫 번째 사진이 메인 프로필 사진으로 사용됩니다
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Card 
          onClick={() => setShowInterestsManager(true)}
          className="hover:shadow-md transition-shadow cursor-pointer"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sliders className="w-5 h-5 text-pink-500" />
                <span className="font-medium">관심사 설정</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">{userKeywords.length}개</span>
                <span className="text-slate-400">›</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowFavoritesModal(true)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">즐겨찾기 관리</span>
                {favoriteUsers.length > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    {favoriteUsers.length}명
                  </span>
                )}
              </div>
              <span className="text-slate-400">›</span>
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Profile Edit Modal */}
      <ProfileEdit
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        currentUser={userProfile}
        onSave={handleProfileSave}
      />

      {/* Interests Management Modal */}
      <InterestsManagement
        isOpen={showInterestsManager}
        onClose={() => setShowInterestsManager(false)}
        currentKeywords={userKeywords}
        onSave={handleKeywordsSave}
      />


    </section>
  );
}
