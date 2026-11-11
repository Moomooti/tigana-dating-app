import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface ApprovalResponse {
  status: ApprovalStatus;
  message: string;
  estimatedTime?: string;
}

export default function ApprovalPending() {
  const [, setLocation] = useLocation();
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Poll approval status every 5 seconds
  const { data: approvalData, refetch } = useQuery({
    queryKey: ['/api/auth/approval-status'],
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  }) as { data: ApprovalResponse | undefined; refetch: () => void };

  // Timer for elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Navigate to main when approved
  useEffect(() => {
    if (approvalData?.status === 'approved') {
      setTimeout(() => {
        setLocation('/');
      }, 2000); // Show success message for 2 seconds before navigating
    }
  }, [approvalData?.status, setLocation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (approvalData?.status) {
      case 'approved':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusTitle = () => {
    switch (approvalData?.status) {
      case 'approved':
        return '승인 완료!';
      case 'rejected':
        return '승인 거부됨';
      default:
        return '승인 대기 중';
    }
  };

  const getStatusMessage = () => {
    switch (approvalData?.status) {
      case 'approved':
        return '프로필 검토가 완료되었습니다. 잠시 후 매칭을 시작하세요!';
      case 'rejected':
        return approvalData?.message || '프로필 검토에서 문제가 발견되었습니다.';
      default:
        return approvalData?.message || '관리자가 프로필을 검토하고 있습니다. 잠시만 기다려주세요.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="p-8 text-center">
            {/* Status Icon */}
            <div className="mb-6">
              {getStatusIcon()}
            </div>

            {/* Status Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {getStatusTitle()}
            </h1>

            {/* Status Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {getStatusMessage()}
            </p>

            {/* Timer */}
            {approvalData?.status === 'pending' && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">대기 시간</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {formatTime(timeElapsed)}
                </div>
                {approvalData?.estimatedTime && (
                  <p className="text-xs text-blue-500 mt-1">
                    예상 시간: {approvalData.estimatedTime}
                  </p>
                )}
              </div>
            )}

            {/* Loading Animation */}
            {approvalData?.status === 'pending' && (
              <div className="flex items-center justify-center space-x-2 mb-6">
                <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                <span className="text-sm text-gray-500">검토 중...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {approvalData?.status === 'approved' && (
                <Button
                  onClick={() => setLocation('/')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  매칭 시작하기
                </Button>
              )}

              {approvalData?.status === 'rejected' && (
                <div className="space-y-2">
                  <Button
                    onClick={() => setLocation('/profile-setup')}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    프로필 다시 설정
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = 'mailto:support@loveconnect.com'}
                    className="w-full"
                  >
                    고객센터 문의
                  </Button>
                </div>
              )}

              {approvalData?.status === 'pending' && (
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="w-full"
                >
                  상태 새로고침
                </Button>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                LoveConnect는 안전한 매칭을 위해 모든 프로필을 검토합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}