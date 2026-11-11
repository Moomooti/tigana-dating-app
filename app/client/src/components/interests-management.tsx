import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, X } from "lucide-react";

interface InterestsManagementProps {
  isOpen: boolean;
  onClose: () => void;
  currentKeywords: string[];
  onSave: (keywords: string[]) => void;
}

const availableKeywords = [
  // 취미/관심사
  "영화감상", "독서", "음악감상", "여행", "요리", "운동", "게임", "사진촬영",
  "그림그리기", "악기연주", "춤", "노래", "등산", "캠핑", "낚시", "골프",
  
  // 성격/특성
  "유머감각", "진솔함", "배려심", "적극성", "차분함", "활발함", "창의적",
  "계획적", "자유로움", "로맨틱", "지적호기심", "감성적",
  
  // 라이프스타일
  "헬스케어", "미니멀라이프", "카페투어", "맛집탐방", "쇼핑", "전시관람",
  "콘서트", "스포츠관람", "반려동물", "가드닝", "홈트레이닝", "명상",
  
  // 직업/관심분야
  "IT/테크", "디자인", "마케팅", "금융", "교육", "의료", "법률", "미디어",
  "예술", "스포츠", "요식업", "패션", "뷰티", "건축",
  
  // 문화/예술
  "클래식", "재즈", "팝송", "K-POP", "드라마", "예능", "다큐멘터리",
  "웹툰", "소설", "시", "뮤지컬", "연극", "갤러리", "박물관"
];

export default function InterestsManagement({ isOpen, onClose, currentKeywords, onSave }: InterestsManagementProps) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(currentKeywords);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => {
      if (prev.includes(keyword)) {
        return prev.filter(k => k !== keyword);
      } else if (prev.length < 10) { // 최대 10개 제한
        return [...prev, keyword];
      }
      return prev;
    });
  };

  const handleSave = () => {
    onSave(selectedKeywords);
    setShowSaveConfirm(true);
    
    setTimeout(() => {
      setShowSaveConfirm(false);
      onClose();
    }, 1500);
  };

  const isChanged = () => {
    return JSON.stringify(currentKeywords.sort()) !== JSON.stringify(selectedKeywords.sort());
  };

  // 카테고리별로 키워드 분류
  const categories = [
    { name: "취미/관심사", keywords: availableKeywords.slice(0, 16) },
    { name: "성격/특성", keywords: availableKeywords.slice(16, 28) },
    { name: "라이프스타일", keywords: availableKeywords.slice(28, 40) },
    { name: "직업/관심분야", keywords: availableKeywords.slice(40, 54) },
    { name: "문화/예술", keywords: availableKeywords.slice(54) }
  ];

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
              <DialogTitle>관심사 설정</DialogTitle>
            </div>
            <DialogDescription>
              나와 맞는 사람을 찾기 위해 관심사를 선택해주세요 (최대 10개)
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* 선택된 키워드 수 표시 */}
            <div className="mb-6 p-3 bg-pink-50 rounded-lg">
              <p className="text-sm text-pink-700">
                <strong>{selectedKeywords.length}/10</strong> 개 선택됨
              </p>
              {selectedKeywords.length >= 10 && (
                <p className="text-xs text-pink-600 mt-1">
                  최대 10개까지 선택할 수 있습니다
                </p>
              )}
            </div>

            {/* 현재 선택된 키워드들 */}
            {selectedKeywords.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">선택된 관심사</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="bg-pink-100 text-pink-700 hover:bg-pink-200 cursor-pointer"
                      onClick={() => toggleKeyword(keyword)}
                    >
                      {keyword}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 카테고리별 키워드 선택 */}
            <div className="space-y-4">
              {categories.map((category) => (
                <Card key={category.name}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {category.keywords.map((keyword) => {
                        const isSelected = selectedKeywords.includes(keyword);
                        const isDisabled = !isSelected && selectedKeywords.length >= 10;
                        
                        return (
                          <Badge
                            key={keyword}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer transition-colors ${
                              isSelected 
                                ? "bg-pink-500 text-white hover:bg-pink-600" 
                                : isDisabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-pink-50 hover:border-pink-300"
                            }`}
                            onClick={() => !isDisabled && toggleKeyword(keyword)}
                          >
                            {keyword}
                            {isSelected && <Plus className="w-3 h-3 ml-1 rotate-45" />}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isChanged() || selectedKeywords.length === 0}
              className="flex-1 pink-gradient text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              저장 ({selectedKeywords.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 저장 완료 확인 */}
      <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <DialogContent className="max-w-sm">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">저장 완료!</h3>
            <p className="text-sm text-slate-600">관심사가 성공적으로 업데이트되었습니다.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}