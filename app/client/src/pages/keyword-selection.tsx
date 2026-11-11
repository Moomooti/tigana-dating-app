import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// 키워드 카테고리 정의 (각 카테고리별 선택 제한)
const KEYWORD_CATEGORIES = {
  외적매력: {
    title: "외적 매력 포인트",
    subtitle: "나의 외적 매력은?",
    subcategories: {
      페이스키워드: {
        keywords: ["강아지상", "고양이상", "토끼상", "여우상", "곰상", "늑대상", "사슴상", "공룡상", "햄스터상", "펭귄상"],
        maxSelection: 1
      },
      인상매력: {
        keywords: ["첫인상킬러", "반전매력", "인간비타민", "훈남/훈녀", "청순가련", "도도한매력", "섹시함폭발", "치명적매력", "동안미모", "성숙한매력"],
        maxSelection: 3
      },
      체형관련: {
        keywords: ["건강미넘침", "포근한매력", "통통한매력", "탄탄한몸매", "슬렌더라인", "어깨깡패", "든든한체격", "아담한매력", "자연스러운체형", "보통체형", "적당한체형", "풍만한매력", "비율깡패", "포동포동한매력"],
        maxSelection: 1
      },
      스타일: {
        keywords: ["옷빨잘받음", "패셔니스타", "꾸안꾸", "럭셔리함", "스타일리시", "아메카지", "미니멀룩", "힙스터"],
        maxSelection: 1
      }
    }
  },
  내적매력: {
    title: "내적 매력 포인트",
    subtitle: "나의 내적 매력은?",
    subcategories: {
      성격TMI: {
        keywords: ["웃음포인트낮음", "텐션높음", "4차원", "긍정에너지", "마당발", "인싸력만렙", "아싸의미학", "소심한매력", "천진난만", "어른스러움"],
        maxSelection: 999,
        minSelection: 1
      },
      매력포인트: {
        keywords: ["목소리깡패", "섹시한매력", "손재주좋음", "요리킹/퀸", "청소깔끔충", "두뇌섹시", "말을잘함", "기억력좋음", "눈치빠름", "센스쟁이", "섬세함"],
        maxSelection: 999,
        minSelection: 1
      },
      취미특기: {
        keywords: ["맛집헌터", "카페홀릭", "OTT중독", "게임폐인", "독서광", "운동중독", "여행광", "사진찍어주는남친력/여친력", "플레이리스트메이커", "기타"],
        maxSelection: 999,
        minSelection: 1,
        allowCustomInput: true
      },
      소통스타일: {
        keywords: ["적당하게연락하는타입", "답장느림주의", "카톡폭격주의", "이모티콘애용", "밈고수", "썰푸는재주", "듣기전문", "공감봇"],
        maxSelection: 999,
        minSelection: 1
      },
      연애스타일: {
        keywords: ["스킨십러버", "말보다행동", "진중함", "애교쟁이", "츤데레", "로맨틱함", "현실적연애", "감성연애", "자유로운연애"],
        maxSelection: 999,
        minSelection: 1
      },
      라이프스타일: {
        keywords: ["홈순이/홈돌이", "액티비티좋아인간", "깔끔쟁이", "미니멀리스트", "수집광", "계획충", "즉흥파", "야식러버", "다이어터", "운동광", "공부쟁이"],
        maxSelection: 999,
        minSelection: 1
      },
      성향: {
        keywords: ["에너지", "내향인간", "외향인간", "감성충만", "이성적판단", "눈치백단", "직설화법", "완벽주의자", "대충주의"],
        maxSelection: 999,
        minSelection: 1
      }
    }
  },
  MBTI: {
    title: "MBTI",
    subtitle: "나의 성격 유형은?",
    subcategories: {
      MBTI유형: {
        keywords: ["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP", "기타"],
        maxSelection: 1,
        allowCustomInput: true
      }
    }
  },
  취미관심사: {
    title: "취미/관심사",
    subtitle: "나의 취미와 관심사는?",
    subcategories: {
      운동액티비티: {
        keywords: ["헬스", "요가", "필라테스", "러닝", "등산", "클라이밍", "수영", "테니스", "골프", "축구", "농구", "배드민턴", "스키/보드", "서핑", "자전거", "볼링", "기타"],
        maxSelection: 999,
        minSelection: 1,
        allowCustomInput: true
      },
      문화예술: {
        keywords: ["영화감상", "드라마시청", "독서", "음악감상", "콘서트", "뮤지컬", "연극", "전시회", "박물관", "사진촬영", "그림그리기", "악기연주", "기타"],
        maxSelection: 999,
        minSelection: 1,
        allowCustomInput: true
      },
      취미생활: {
        keywords: ["요리", "베이킹", "카페투어", "맛집탐방", "게임", "보드게임", "쇼핑", "인테리어", "정리정돈", "원예", "반려동물", "기타"],
        maxSelection: 999,
        minSelection: 1,
        allowCustomInput: true
      },
      자기계발: {
        keywords: ["어학공부", "자격증취득", "온라인강의", "독서모임", "스터디", "세미나참석", "봉사활동", "기타"],
        maxSelection: 999,
        minSelection: 1,
        allowCustomInput: true
      }
    }
  },

  데이트스타일: {
    title: "데이트 스타일",
    subtitle: "선호하는 데이트 스타일은?",
    subcategories: {
      실내: {
        keywords: ["홈데이트", "카페데이트", "영화관", "쇼핑", "전시회", "방탈출", "PC방", "노래방", "쿠킹클래스"],
        maxSelection: 999
      },
      실외: {
        keywords: ["산책", "드라이브", "놀이공원", "한강공원", "맛집탐방", "페스티벌", "야구장", "등산", "캠핑"],
        maxSelection: 999
      }
    }
  },
  라이프스타일상세: {
    title: "라이프스타일",
    subtitle: "나의 라이프스타일은?",
    subcategories: {
      음주: {
        keywords: ["전혀안마심", "가끔마심", "자주마심", "분위기따라"],
        maxSelection: 1
      },
      흡연: {
        keywords: ["비흡연", "흡연", "전자담배", "금연중"],
        maxSelection: 1
      },
      반려동물: {
        keywords: ["키우고있음", "키우고싶음", "관심없음", "알레르기있음"],
        maxSelection: 1
      }
    }
  }
};

export default function KeywordSelection() {
  const [, setLocation] = useLocation();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [customInputs, setCustomInputs] = useState<{[key: string]: string}>({});
  const [showCustomInput, setShowCustomInput] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const categoryKeys = Object.keys(KEYWORD_CATEGORIES);
  const currentCategoryKey = categoryKeys[currentCategoryIndex];
  const currentCategory = KEYWORD_CATEGORIES[currentCategoryKey as keyof typeof KEYWORD_CATEGORIES];
  const progress = ((currentCategoryIndex + 1) / categoryKeys.length) * 100;

  const saveKeywordsMutation = useMutation({
    mutationFn: async (keywords: string[]) => {
      const response = await apiRequest("POST", "/api/users/keywords", {
        keywords
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "키워드 설정 완료!",
        description: "이제 매칭을 시작할 수 있어요.",
      });
      setLocation("/profile-display-setup");
    },
    onError: () => {
      toast({
        title: "오류",
        description: "키워드 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleCustomInput = (subcategoryName: string, customValue: string) => {
    if (customValue.trim()) {
      const customKeyword = customValue.trim();
      setSelectedKeywords(prev => [...prev, customKeyword]);
      setShowCustomInput(prev => ({ ...prev, [subcategoryName]: false }));
      setCustomInputs(prev => ({ ...prev, [subcategoryName]: '' }));
    }
  };

  const toggleKeyword = (keyword: string, subcategoryName: string) => {
    const subcategory = currentCategory.subcategories[subcategoryName as keyof typeof currentCategory.subcategories];
    if (!subcategory) return;
    
    // "기타" 클릭 시 커스텀 입력 모드 활성화
    if (keyword === "기타" && 'allowCustomInput' in subcategory && subcategory.allowCustomInput) {
      setShowCustomInput(prev => ({ ...prev, [subcategoryName]: true }));
      return;
    }
    
    const maxSelection = subcategory.maxSelection;
    
    setSelectedKeywords(prev => {
      if (prev.includes(keyword)) {
        return prev.filter(k => k !== keyword);
      } else {
        // Check if we're at the max selection limit for this subcategory
        const currentSubcategoryKeywords = prev.filter(k => 
          subcategory.keywords.includes(k)
        );
        
        if (currentSubcategoryKeywords.length >= maxSelection) {
          // Remove the oldest selected keyword from this subcategory if at limit
          const oldestKeyword = currentSubcategoryKeywords[0];
          return prev.filter(k => k !== oldestKeyword).concat(keyword);
        } else {
          return [...prev, keyword];
        }
      }
    });
  };

  const handleNext = () => {
    // Check if it's the 내적매력 or 취미관심사 category and validate minimum selections
    if (currentCategoryKey === '내적매력' || currentCategoryKey === '취미관심사') {
      const missingCategories: string[] = [];
      Object.entries(currentCategory.subcategories).forEach(([subcategoryName, subcategory]) => {
        // 해당 서브카테고리에 속하는 키워드만 검증
        const subcategorySelectedCount = selectedKeywords.filter(k => 
          subcategory.keywords.includes(k)
        ).length;
        if ('minSelection' in subcategory && subcategory.minSelection && subcategorySelectedCount < subcategory.minSelection) {
          missingCategories.push(subcategoryName);
        }
      });
      
      if (missingCategories.length > 0) {
        toast({
          title: "선택 필요",
          description: `${missingCategories.join(', ')}에서 최소 1개씩 선택해주세요.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentCategoryIndex < categoryKeys.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else {
      // 마지막 카테고리 - 키워드 저장
      saveKeywordsMutation.mutate(selectedKeywords);
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    }
  };

  const isLastCategory = currentCategoryIndex === categoryKeys.length - 1;
  const categoryKeywords = selectedKeywords.filter(keyword => 
    Object.values(currentCategory.subcategories).some(subcategory => 
      subcategory.keywords.includes(keyword)
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4">
      <div className="max-w-md mx-auto">
        {/* Skip Button */}
        <div className="flex justify-end mb-4 pt-4">
          <Button
            onClick={() => setLocation('/profile-setup')}
            variant="outline"
            size="sm"
            className="text-gray-500 border-gray-300 hover:bg-gray-50"
          >
            건너뛰기
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentCategoryIndex === 0}
            className="text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800">키워드 선택</h1>
            <p className="text-sm text-slate-600">{currentCategoryIndex + 1} / {categoryKeys.length}</p>
          </div>
          
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Category Info */}
        <Card className="p-6 mb-6">
          <div className="text-center mb-6">
            <Heart className="w-8 h-8 text-pink-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{currentCategory.title}</h2>
            <p className="text-slate-600">{currentCategory.subtitle}</p>
            {categoryKeywords.length > 0 && (
              <p className="text-sm text-pink-600 mt-2">{categoryKeywords.length}개 선택됨</p>
            )}
          </div>

          {/* Keywords by Subcategory */}
          <div className="space-y-6">
            {Object.entries(currentCategory.subcategories).map(([subcategoryName, subcategory]) => {
              // 해당 서브카테고리에 속하는 키워드만 카운트
              const subcategorySelectedCount = selectedKeywords.filter(k => 
                subcategory.keywords.includes(k)
              ).length;
              
              return (
                <div key={subcategoryName}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">{subcategoryName}</h3>
                    <span className="text-xs text-slate-500">
                      {subcategory.maxSelection === 999 
                        ? `${subcategorySelectedCount}개 선택${'minSelection' in subcategory && subcategory.minSelection ? ` (최소 ${subcategory.minSelection}개)` : ''}` 
                        : `${subcategorySelectedCount}/${subcategory.maxSelection}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {subcategory.keywords.map((keyword) => {
                      const isSelected = selectedKeywords.includes(keyword);
                      const canSelect = isSelected || subcategorySelectedCount < subcategory.maxSelection;
                      
                      return (
                        <Badge
                          key={keyword}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer text-center py-2 px-3 text-xs transition-all hover:scale-105 ${
                            isSelected
                              ? "bg-pink-500 text-white hover:bg-pink-600"
                              : canSelect
                              ? "bg-white text-slate-700 hover:bg-pink-50 border-slate-200"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                          }`}
                          onClick={() => canSelect && toggleKeyword(keyword, subcategoryName)}
                        >
                          {keyword}
                        </Badge>
                      );
                    })}
                  </div>
                  
                  {/* 커스텀 입력 필드 */}
                  {showCustomInput[subcategoryName] && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="직접 입력하세요"
                        value={customInputs[subcategoryName] || ''}
                        onChange={(e) => setCustomInputs(prev => ({ ...prev, [subcategoryName]: e.target.value }))}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCustomInput(subcategoryName, customInputs[subcategoryName] || '');
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleCustomInput(subcategoryName, customInputs[subcategoryName] || '')}
                        className="bg-pink-500 hover:bg-pink-600 text-white"
                      >
                        추가
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCustomInput(prev => ({ ...prev, [subcategoryName]: false }))}
                      >
                        취소
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected Keywords Summary */}
        {selectedKeywords.length > 0 && (
          <Card className="p-4 mb-6 bg-pink-50 border-pink-200">
            <h3 className="text-sm font-semibold text-pink-800 mb-2">선택된 키워드 ({selectedKeywords.length}개)</h3>
            <div className="flex flex-wrap gap-1">
              {selectedKeywords.slice(-10).map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                  {keyword}
                </Badge>
              ))}
              {selectedKeywords.length > 10 && (
                <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                  +{selectedKeywords.length - 10}개 더
                </Badge>
              )}
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCategoryIndex === 0}
            className="flex-1"
          >
            이전
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={saveKeywordsMutation.isPending}
            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
          >
            {saveKeywordsMutation.isPending ? (
              "저장 중..."
            ) : isLastCategory ? (
              "완료"
            ) : (
              <>
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}