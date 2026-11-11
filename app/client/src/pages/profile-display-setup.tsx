import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Check, Grid3X3, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface SelectedKeywords {
  keywords: string[];
}

export default function ProfileDisplaySetup() {
  const [, setLocation] = useLocation();
  const [selectedForDisplay, setSelectedForDisplay] = useState<string[]>([]);
  const [allKeywords, setAllKeywords] = useState<string[]>([]);

  // Fetch user's selected keywords
  const { data: keywordsData } = useQuery<SelectedKeywords>({
    queryKey: ['/api/users/current-user/selected-keywords'],
  });

  // Process keywords when data is loaded
  useEffect(() => {
    if (keywordsData && keywordsData.keywords) {
      setAllKeywords(keywordsData.keywords);
      // Auto-select first 4 keywords for display
      setSelectedForDisplay(keywordsData.keywords.slice(0, 4));
    }
  }, [keywordsData]);

  const handleKeywordToggle = (keyword: string) => {
    setSelectedForDisplay(prev => {
      const currentSelection = prev || [];
      if (currentSelection.includes(keyword)) {
        return currentSelection.filter(k => k !== keyword);
      } else if (currentSelection.length < 4) {
        return [...currentSelection, keyword];
      } else {
        // Replace the last selected keyword
        return [...currentSelection.slice(0, 3), keyword];
      }
    });
  };

  const handleContinue = () => {
    if (selectedForDisplay && selectedForDisplay.length === 4) {
      // Save selected display keywords to storage or API
      // For now, proceed to profile setup
      setLocation('/profile-setup');
    }
  };

  const getKeywordCategory = (keyword: string) => {
    // Since we now only have a simple keywords array, 
    // we'll categorize based on keyword content
    const mbtiTypes = ["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", 
                       "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"];
    
    if (mbtiTypes.includes(keyword)) return 'mbti';
    
    // External appearance keywords
    const externalKeywords = ["강아지상", "고양이상", "토끼상", "여우상", "곰상", "늑대상", 
                              "사슴상", "공룡상", "햄스터상", "펭귄상", "첫인상킬러", "반전매력"];
    if (externalKeywords.some(k => keyword.includes(k) || k.includes(keyword))) return 'external';
    
    // Hobby/activity keywords
    const hobbyKeywords = ["헬스", "요가", "필라테스", "러닝", "등산", "영화감상", "독서", 
                           "음악감상", "요리", "여행", "게임", "운동"];
    if (hobbyKeywords.some(k => keyword.includes(k) || k.includes(keyword))) return 'hobby';
    
    // Default to internal personality traits
    return 'internal';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'external': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'internal': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'mbti': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'hobby': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/keywords')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">프로필 키워드 선택</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <div className="w-12 h-1 bg-pink-500 rounded"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <div className="w-12 h-1 bg-gray-200 rounded"></div>
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
          </div>
          <p className="text-center text-sm text-gray-600">2/3 단계</p>
        </div>

        {/* Instructions */}
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Grid3X3 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            프로필에 표시할 키워드 선택
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            다른 사용자에게 보여질 프로필의 4개 키워드를 선택해주세요.<br/>
            매력적인 키워드로 첫인상을 만들어보세요!
          </p>
        </div>

        {/* Preview Card */}
        <Card className="mb-6 border-2 border-pink-200 bg-gradient-to-br from-white to-pink-50">
          <CardContent className="p-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900">프로필 미리보기</h3>
            </div>
            
            {/* Grid Preview */}
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="h-12 bg-white rounded-lg border-2 border-dashed border-pink-300 flex items-center justify-center"
                >
                  {selectedForDisplay && selectedForDisplay[index] ? (
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium ${getCategoryColor(getKeywordCategory(selectedForDisplay[index]))}`}
                    >
                      {selectedForDisplay[index]}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">키워드 {index + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selection Status */}
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600">
            선택된 키워드: <span className="font-semibold text-pink-600">{selectedForDisplay?.length || 0}/4</span>
          </p>
        </div>

        {/* Keywords List */}
        <div className="space-y-4 mb-8">
          <h3 className="font-semibold text-gray-900">내가 선택한 모든 키워드</h3>
          
          {allKeywords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>선택된 키워드가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allKeywords.map((keyword, index) => {
                const isSelected = selectedForDisplay?.includes(keyword) || false;
                const category = getKeywordCategory(keyword);
                
                return (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-pink-400 bg-pink-50 shadow-md' 
                        : 'border-gray-200 hover:border-pink-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleKeywordToggle(keyword)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCategoryColor(category)}`}
                          >
                            {keyword}
                          </Badge>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
            })}
          </div>
          )}
        </div>

        {/* Continue Button */}
        <div className="pb-8">
          <Button
            onClick={handleContinue}
            disabled={!selectedForDisplay || selectedForDisplay.length !== 4}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedForDisplay && selectedForDisplay.length === 4 ? '다음 단계로' : `${4 - (selectedForDisplay?.length || 0)}개 더 선택해주세요`}
          </Button>
        </div>
      </div>
    </div>
  );
}