import { useState } from "react";
import { useLocation } from "wouter";
import MatchedProfile from "@/components/matched-profile";

export default function MatchedProfilePage() {
  const [location, setLocation] = useLocation();
  const [isFavorited, setIsFavorited] = useState(false);

  // Mock matched user data - in real app this would come from route params/API
  const matchedUser = {
    id: "user2",
    name: "이서연",
    age: 27,
    gender: "female",
    bio: "카페에서 책 읽는 시간을 좋아하는 마케터입니다. 새로운 곳을 탐험하고 맛있는 음식을 찾아다니는 것이 취미예요. 진솔한 대화를 나눌 수 있는 분을 만나고 싶어요 ☕📚",
    location: "서초구",
    occupation: "마케터",
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
      "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
    ],
    keywords: [
      "독서", "카페투어", "맛집탐방", "마케팅", "여행", "진솔함", "영화감상", "요리"
    ]
  };

  const handleBack = () => {
    setLocation("/");
  };

  const handleStartChat = () => {
    // Navigate to chat with this user
    setLocation(`/chat/${matchedUser.id}`);
  };

  const handleAddToFavorites = () => {
    setIsFavorited(!isFavorited);
    // In real app, this would call API to add/remove from favorites
  };

  return (
    <MatchedProfile
      matchedUser={matchedUser}
      onBack={handleBack}
      onStartChat={handleStartChat}
      onAddToFavorites={handleAddToFavorites}
      isFavorited={isFavorited}
    />
  );
}