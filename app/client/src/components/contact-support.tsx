import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Mail } from "lucide-react";

interface ContactSupportProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSupport({ isOpen, onClose }: ContactSupportProps) {
  console.log("ContactSupport 렌더링됨, isOpen:", isOpen);
  
  const [inquiryType, setInquiryType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("yues7864@knu.ac.kr");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = () => {
    if (!inquiryType || !subject || !message) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    // 실제 구현에서는 API 호출
    console.log("문의 제출:", {
      inquiryType,
      subject,
      message,
      email,
      timestamp: new Date()
    });

    setShowSuccessModal(true);
    
    // 폼 초기화 (이메일은 고정값으로 유지)
    setInquiryType("");
    setSubject("");
    setMessage("");
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
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
              <DialogTitle>문의하기</DialogTitle>
            </div>
            <DialogDescription>
              궁금한 점이나 문제를 신속하게 해결해드립니다
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* 빠른 연락처 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-pink-500" />
                  <span>빠른 연락</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">이메일</span>
                  </div>
                  <span className="text-sm text-gray-600">yues7864@knu.ac.kr</span>
                </div>
              </CardContent>
            </Card>

            {/* 문의 폼 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Send className="w-4 h-4 text-pink-500" />
                  <span>온라인 문의</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">문의 유형</Label>
                  <Select value={inquiryType} onValueChange={setInquiryType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="문의 유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account">계정 관련</SelectItem>
                      <SelectItem value="matching">매칭 관련</SelectItem>
                      <SelectItem value="payment">결제 관련</SelectItem>
                      <SelectItem value="bug">버그 신고</SelectItem>
                      <SelectItem value="suggestion">개선 제안</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">제목</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="문의 제목을 입력하세요"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm">내용</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="문의 내용을 자세히 작성해주세요"
                    className="mt-1 min-h-24"
                  />
                </div>

                <div>
                  <Label className="text-sm">답변 받을 이메일</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yues7864@knu.ac.kr"
                    className="mt-1"
                    readOnly
                    disabled
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full pink-gradient text-white"
                  disabled={!inquiryType || !subject || !message}
                >
                  <Send className="w-4 h-4 mr-2" />
                  문의 제출
                </Button>
              </CardContent>
            </Card>


          </div>
        </DialogContent>
      </Dialog>

      {/* 성공 모달 */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-pink-600">문의 접수 완료</DialogTitle>
            <DialogDescription className="text-center">
              문의해주셔서 감사합니다!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-pink-500" />
            </div>
            <p className="text-sm text-gray-600 mb-2">
              24시간 내에 답변드리겠습니다.
            </p>
            <p className="text-xs text-gray-500">
              답변은 입력하신 이메일로 발송됩니다.
            </p>
          </div>
          <Button
            onClick={handleSuccessClose}
            className="w-full pink-gradient text-white"
          >
            확인
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}