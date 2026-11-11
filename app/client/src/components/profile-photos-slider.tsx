import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Camera, Plus, X, Image } from "lucide-react";

interface ProfilePhotosSliderProps {
  photos: string[];
  isEditable?: boolean;
  onPhotosChange?: (photos: string[]) => void;
}

export default function ProfilePhotosSlider({ 
  photos, 
  isEditable = false, 
  onPhotosChange 
}: ProfilePhotosSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [galleryPermissionGranted, setGalleryPermissionGranted] = useState(false);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const newPhotos = photos.filter((_, index) => index !== indexToRemove);
    onPhotosChange?.(newPhotos);
    
    // Adjust current index if needed
    if (currentIndex >= newPhotos.length && newPhotos.length > 0) {
      setCurrentIndex(newPhotos.length - 1);
    } else if (newPhotos.length === 0) {
      setCurrentIndex(0);
    }
  };

  const handleAddPhoto = () => {
    if (!galleryPermissionGranted) {
      setShowPermissionDialog(true);
      return;
    }
    openGallery();
  };

  const handlePermissionAllow = () => {
    setGalleryPermissionGranted(true);
    setShowPermissionDialog(false);
    openGallery();
  };

  const handlePermissionDeny = () => {
    setShowPermissionDialog(false);
  };

  const openGallery = () => {
    // 실제 갤러리 접근 (웹에서는 파일 입력 사용)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      
      if (files) {
        // 파일을 URL로 변환하여 미리보기
        const newPhotos: string[] = [];
        const fileArray = Array.from(files);
        
        fileArray.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              newPhotos.push(event.target.result as string);
              
              // 모든 파일이 로드되면 상태 업데이트
              if (newPhotos.length === fileArray.length) {
                const updatedPhotos = [...photos, ...newPhotos];
                onPhotosChange?.(updatedPhotos.slice(0, 5)); // 최대 5장
              }
            }
          };
          reader.readAsDataURL(file);
        });
      }
    };
    
    input.click();
  };

  if (photos.length === 0 && isEditable) {
    return (
      <Card className="h-96 border-2 border-dashed border-pink-300">
        <CardContent className="h-full flex flex-col items-center justify-center p-6">
          <Camera className="w-12 h-12 text-pink-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">사진을 추가하세요</h3>
          <p className="text-sm text-slate-500 text-center mb-4">
            최대 5장의 사진을 업로드할 수 있습니다
          </p>
          <Button 
            onClick={handleAddPhoto}
            className="pink-gradient text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            첫 번째 사진 추가
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (photos.length === 0) {
    return (
      <Card className="h-96 bg-gray-100">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">등록된 사진이 없습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <Card className="overflow-hidden">
        <div className="relative h-96">
          <img 
            src={photos[currentIndex]} 
            alt={`프로필 사진 ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* Photo counter */}
          {photos.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          )}

          {/* Edit controls */}
          {isEditable && (
            <div className="absolute top-4 left-4 flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemovePhoto(currentIndex)}
                className="bg-red-500/80 backdrop-blur-sm text-white hover:bg-red-600/80 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
              {photos.length < 5 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddPhoto}
                  className="bg-green-500/80 backdrop-blur-sm text-white hover:bg-green-600/80 rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Dots indicator */}
      {photos.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-pink-500 w-6' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Add more photos button */}
      {isEditable && photos.length > 0 && photos.length < 5 && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={handleAddPhoto}
            className="border-pink-300 text-pink-600 hover:bg-pink-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            사진 추가 ({photos.length}/5)
          </Button>
        </div>
      )}

      {/* 갤러리 접근 권한 요청 다이얼로그 */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-pink-500" />
              갤러리 접근 권한
            </DialogTitle>
            <DialogDescription className="text-left">
              사진을 추가하기 위해 갤러리 접근 권한이 필요합니다.
              <br />
              갤러리에 접근하도록 허용하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handlePermissionDeny}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              허용 안함
            </Button>
            <Button
              onClick={handlePermissionAllow}
              className="flex-1 pink-gradient text-white"
            >
              허용
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}