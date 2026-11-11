import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Save, MapPin, Briefcase, User, Calendar, Users } from "lucide-react";

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    age: number;
    gender: string;
    bio: string;
    location: string;
    occupation: string;
  };
  onSave: (updatedProfile: any) => void;
}

export default function ProfileEdit({ isOpen, onClose, currentUser, onSave }: ProfileEditProps) {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    age: currentUser.age.toString(),
    gender: currentUser.gender,
    bio: currentUser.bio,
    location: currentUser.location,
    occupation: currentUser.occupation
  });

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updatedProfile = {
      ...formData,
      age: parseInt(formData.age) || currentUser.age
    };
    onSave(updatedProfile);
    setShowSaveConfirm(true);
    
    setTimeout(() => {
      setShowSaveConfirm(false);
      onClose();
    }, 1500);
  };

  const isFormChanged = () => {
    return (
      formData.name !== currentUser.name ||
      formData.age !== currentUser.age.toString() ||
      formData.gender !== currentUser.gender ||
      formData.bio !== currentUser.bio ||
      formData.location !== currentUser.location ||
      formData.occupation !== currentUser.occupation
    );
  };

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
              <DialogTitle>프로필 수정</DialogTitle>
            </div>
            <DialogDescription>
              매력적인 프로필로 더 많은 매칭 기회를 만들어보세요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 이름 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <User className="w-4 h-4 text-pink-500" />
                  <span>이름</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="이름을 입력하세요"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.name.length}/20</p>
              </CardContent>
            </Card>

            {/* 나이 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span>나이</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={formData.age} onValueChange={(value) => handleInputChange('age', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="나이를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 61 }, (_, i) => i + 20).map((age) => (
                      <SelectItem key={age} value={age.toString()}>
                        {age}세
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 성별 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Users className="w-4 h-4 text-pink-500" />
                  <span>성별</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="성별을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">여성</SelectItem>
                    <SelectItem value="male">남성</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 자기소개 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">자기소개</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="자신을 소개해주세요"
                  maxLength={200}
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200</p>
              </CardContent>
            </Card>

            {/* 위치 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-pink-500" />
                  <span>지역</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="지역을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="강남구">강남구</SelectItem>
                    <SelectItem value="서초구">서초구</SelectItem>
                    <SelectItem value="송파구">송파구</SelectItem>
                    <SelectItem value="강동구">강동구</SelectItem>
                    <SelectItem value="마포구">마포구</SelectItem>
                    <SelectItem value="홍대">홍대</SelectItem>
                    <SelectItem value="신촌">신촌</SelectItem>
                    <SelectItem value="이태원">이태원</SelectItem>
                    <SelectItem value="명동">명동</SelectItem>
                    <SelectItem value="종로구">종로구</SelectItem>
                    <SelectItem value="용산구">용산구</SelectItem>
                    <SelectItem value="성동구">성동구</SelectItem>
                    <SelectItem value="광진구">광진구</SelectItem>
                    <SelectItem value="동대문구">동대문구</SelectItem>
                    <SelectItem value="중랑구">중랑구</SelectItem>
                    <SelectItem value="성북구">성북구</SelectItem>
                    <SelectItem value="강북구">강북구</SelectItem>
                    <SelectItem value="도봉구">도봉구</SelectItem>
                    <SelectItem value="노원구">노원구</SelectItem>
                    <SelectItem value="은평구">은평구</SelectItem>
                    <SelectItem value="서대문구">서대문구</SelectItem>
                    <SelectItem value="양천구">양천구</SelectItem>
                    <SelectItem value="강서구">강서구</SelectItem>
                    <SelectItem value="구로구">구로구</SelectItem>
                    <SelectItem value="금천구">금천구</SelectItem>
                    <SelectItem value="영등포구">영등포구</SelectItem>
                    <SelectItem value="동작구">동작구</SelectItem>
                    <SelectItem value="관악구">관악구</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 직업 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-pink-500" />
                  <span>직업</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="직업을 입력하세요"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.occupation.length}/50</p>
              </CardContent>
            </Card>
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
              disabled={!isFormChanged()}
              className="flex-1 pink-gradient text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              저장
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
            <p className="text-sm text-slate-600">프로필이 성공적으로 업데이트되었습니다.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}