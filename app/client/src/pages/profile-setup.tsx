import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Camera, Phone, User, Check, ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProfilePhotosSlider from '@/components/profile-photos-slider';

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [photos, setPhotos] = useState<(File | null)[]>(Array(6).fill(null));
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [showPhotoSlider, setShowPhotoSlider] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const { toast } = useToast();

  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await apiRequest('POST', '/api/users/profile', profileData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "프로필 설정 완료!",
        description: "이제 매칭을 시작할 수 있어요.",
      });
      setLocation('/approval-pending');
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: "프로필 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const sendVerificationMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiRequest('POST', '/api/auth/send-verification', { phoneNumber: phone });
      return response.json();
    },
    onSuccess: () => {
      setIsCodeSent(true);
      toast({
        title: "인증번호 전송",
        description: "인증번호가 전송되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: "인증번호 전송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      const response = await apiRequest('POST', '/api/auth/verify-phone', { phoneNumber: phone, verificationCode: code });
      return response.json();
    },
    onSuccess: () => {
      setIsPhoneVerified(true);
      toast({
        title: "인증 완료",
        description: "전화번호 인증이 완료되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "인증 실패",
        description: "잘못된 인증번호입니다.",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (index: number, file: File) => {
    const newPhotos = [...photos];
    newPhotos[index] = file;
    setPhotos(newPhotos);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  const handleSendVerification = () => {
    if (phoneNumber.length >= 10) {
      sendVerificationMutation.mutate(phoneNumber);
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      verifyCodeMutation.mutate({ phone: phoneNumber, code: verificationCode });
    }
  };

  const handleComplete = () => {
    const profileData = {
      nickname,
      phoneNumber,
      photos: photos.filter(p => p !== null),
    };
    saveProfileMutation.mutate(profileData);
  };

  const canProceedStep1 = photos.filter(p => p !== null).length >= 2;
  const canProceedStep2 = nickname.trim().length >= 2;
  const canComplete = canProceedStep1 && canProceedStep2 && isPhoneVerified;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/profile-display-setup')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">프로필 설정</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Progress Steps */}
        <div className="text-center mb-6">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  currentStep >= step ? 'bg-pink-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">{currentStep}/3 단계</p>
        </div>

        {/* Step 1: 사진 업로드 */}
        {currentStep === 1 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Camera className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                <h2 className="text-xl font-semibold mb-2">사진을 업로드해주세요</h2>
                <p className="text-gray-600 text-sm">최소 2장, 최대 6장까지 업로드 가능합니다</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg relative overflow-hidden"
                  >
                    {photo ? (
                      <>
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => {
                            setSelectedPhotoIndex(index);
                            setShowPhotoSlider(true);
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(index);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(index, file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedStep1}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              >
                다음 ({photos.filter(p => p !== null).length}/6장)
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: 닉네임 설정 */}
        {currentStep === 2 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <User className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                <h2 className="text-xl font-semibold mb-2">닉네임을 설정해주세요</h2>
                <p className="text-gray-600 text-sm">다른 사용자들에게 보여질 이름입니다</p>
              </div>

              <div className="space-y-4 mb-6">
                <Input
                  placeholder="닉네임 입력 (2-10자)"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={10}
                  className="text-center"
                />
                <p className="text-sm text-gray-500 text-center">
                  {nickname.length}/10자
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  이전
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedStep2}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                >
                  다음
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: 전화번호 인증 */}
        {currentStep === 3 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Phone className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                <h2 className="text-xl font-semibold mb-2">전화번호 인증</h2>
                <p className="text-gray-600 text-sm">안전한 매칭을 위해 본인 인증이 필요합니다</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex space-x-2">
                  <Input
                    placeholder="010-0000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9-]/g, ''))}
                    disabled={isPhoneVerified}
                    className={isPhoneVerified ? 'bg-green-50 border-green-300' : ''}
                  />
                  {!isPhoneVerified && (
                    <Button
                      onClick={handleSendVerification}
                      disabled={phoneNumber.length < 10 || sendVerificationMutation.isPending}
                      variant="outline"
                    >
                      {sendVerificationMutation.isPending ? '전송중...' : '인증번호'}
                    </Button>
                  )}
                  {isPhoneVerified && (
                    <div className="flex items-center px-3 bg-green-100 rounded-md">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </div>

                {isCodeSent && !isPhoneVerified && (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="인증번호 6자리"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      maxLength={6}
                    />
                    <Button
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length !== 6 || verifyCodeMutation.isPending}
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      {verifyCodeMutation.isPending ? '확인중...' : '확인'}
                    </Button>
                  </div>
                )}

                {isPhoneVerified && (
                  <div className="text-center text-green-600 text-sm">
                    ✓ 전화번호 인증이 완료되었습니다
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  이전
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!canComplete || saveProfileMutation.isPending}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                >
                  {saveProfileMutation.isPending ? '저장중...' : '완료'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photo Slider */}
        <ProfilePhotosSlider
          photos={photos.filter((photo) => photo !== null).map((photo) => URL.createObjectURL(photo!))}
          isOpen={showPhotoSlider}
          onClose={() => setShowPhotoSlider(false)}
          initialIndex={selectedPhotoIndex}
        />
      </div>
    </div>
  );
}