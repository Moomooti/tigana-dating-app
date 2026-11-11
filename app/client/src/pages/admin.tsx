import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@shared/schema';
import { 
  Users, 
  CreditCard, 
  Settings, 
  BarChart3, 
  Shield,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Download
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  userId: string;
  username: string;
  amount: number;
  credits: number;
  status: string;
  paymentMethod: string;
  tid?: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalCreditsIssued: number;
  pendingPayments: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalCreditsIssued: 0,
    pendingPayments: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<any>({});
  const { toast } = useToast();

  // 관리자 권한 확인
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const handleAdminLogin = () => {
    // 간단한 관리자 인증 (실제로는 더 보안이 강화된 방식 사용)
    if (adminPassword === 'tigana2025admin') {
      setIsAdmin(true);
      setShowLogin(false);
      toast({
        title: "관리자 로그인 성공",
        description: "티가나 관리자 대시보드에 오신 것을 환영합니다.",
      });
    } else {
      toast({
        title: "로그인 실패",
        description: "관리자 비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      });
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 사용자 목록 로드
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // 결제 내역 로드
      const paymentsResponse = await fetch('/api/admin/payments');
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }

      // 통계 로드
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // 테이블 데이터 로드
      const tablesResponse = await fetch('/api/admin/tables');
      if (tablesResponse.ok) {
        const tablesData = await tablesResponse.json();
        setTableData(tablesData);
      }
    } catch (error) {
      console.error('관리자 데이터 로드 실패:', error);
      toast({
        title: "데이터 로드 실패",
        description: "관리자 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        await loadDashboardData();
        toast({
          title: isActive ? "사용자 비활성화" : "사용자 활성화",
          description: `사용자 상태가 ${isActive ? '비활성화' : '활성화'}되었습니다.`,
        });
      }
    } catch (error) {
      toast({
        title: "상태 변경 실패",
        description: "사용자 상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const addCreditsToUser = async (userId: string, credits: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits })
      });

      if (response.ok) {
        await loadDashboardData();
        toast({
          title: "크레딧 지급 완료",
          description: `${credits} 크레딧이 지급되었습니다.`,
        });
      }
    } catch (error) {
      toast({
        title: "크레딧 지급 실패",
        description: "크레딧 지급 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const exportData = async (type: 'users' | 'payments') => {
    try {
      const response = await fetch(`/api/admin/export/${type}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tigana_${type}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "내보내기 완료",
          description: `${type === 'users' ? '사용자' : '결제'} 데이터가 다운로드되었습니다.`,
        });
      }
    } catch (error) {
      toast({
        title: "내보내기 실패",
        description: "데이터 내보내기 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone || '').includes(searchTerm)
  );

  if (showLogin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-pink-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">티가나 관리자</CardTitle>
            <CardDescription>관리자 권한이 필요합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">관리자 비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="관리자 비밀번호를 입력하세요"
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
            </div>
            <Button 
              onClick={handleAdminLogin} 
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              로그인
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">티가나 관리자 대시보드</h1>
              <p className="text-gray-600 mt-1">사용자와 결제를 관리하세요</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => loadDashboardData()} 
                variant="outline" 
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </Button>
              <Button onClick={() => setShowLogin(true)} variant="outline">
                로그아웃
              </Button>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 사용자</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 매출</p>
                  <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}원</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">발행 크레딧</p>
                  <p className="text-2xl font-bold">{stats.totalCreditsIssued}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">대기 결제</p>
                  <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="payments">결제 내역</TabsTrigger>
            <TabsTrigger value="database">데이터베이스</TabsTrigger>
            <TabsTrigger value="settings">시스템 설정</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>사용자 목록</CardTitle>
                    <CardDescription>등록된 모든 사용자를 관리하세요</CardDescription>
                  </div>
                  <Button onClick={() => exportData('users')} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    내보내기
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="이름, 이메일, 전화번호로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>전화번호</TableHead>
                      <TableHead>러브 크레딧</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead>관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.loveCredits || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "활성" : "비활성"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleUserStatus(user.id, user.isActive)}
                            >
                              {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const credits = prompt('지급할 크레딧 수를 입력하세요:');
                                if (credits && !isNaN(Number(credits))) {
                                  addCreditsToUser(user.id, Number(credits));
                                }
                              }}
                            >
                              크레딧
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>결제 내역</CardTitle>
                    <CardDescription>모든 결제 거래를 확인하세요</CardDescription>
                  </div>
                  <Button onClick={() => exportData('payments')} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    내보내기
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>사용자</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>크레딧</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>결제수단</TableHead>
                      <TableHead>거래ID</TableHead>
                      <TableHead>날짜</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.username}</TableCell>
                        <TableCell>{payment.amount.toLocaleString()}원</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{payment.credits}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={payment.status === 'SUCCESS' ? "default" : payment.status === 'PENDING' ? "secondary" : "destructive"}
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell className="font-mono text-sm">{payment.tid}</TableCell>
                        <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>데이터베이스 테이블 현황</CardTitle>
                <CardDescription>모든 데이터베이스 테이블의 현재 상태를 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 사용자 테이블 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        사용자 (Users)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">총 레코드:</span>
                          <Badge variant="secondary">{tableData.users?.count || 0}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          사용자 계정, 프로필 정보
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 매칭 테이블 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Users className="w-5 h-5 mr-2 text-green-600" />
                        매칭 (Matches)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">총 레코드:</span>
                          <Badge variant="secondary">{tableData.matches?.count || 0}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          사용자 간 성공적인 매칭
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 스와이프 테이블 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-purple-600" />
                        스와이프 (Swipes)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">총 레코드:</span>
                          <Badge variant="secondary">{tableData.swipes?.count || 0}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          사용자 스와이프 활동 기록
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 대화 테이블 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
                        대화 (Conversations)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">총 레코드:</span>
                          <Badge variant="secondary">{tableData.conversations?.count || 0}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          활성 대화방 및 채팅 세션
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 메시지 테이블 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-red-600" />
                        메시지 (Messages)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">총 레코드:</span>
                          <Badge variant="secondary">{tableData.messages?.count || 0}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          전체 채팅 메시지 내역
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 전화 인증 테이블 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-teal-600" />
                        전화 인증 (Phone Verifications)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">총 레코드:</span>
                          <Badge variant="secondary">{tableData.phoneVerifications?.count || 0}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          전화번호 인증 기록
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 사용자 세션 테이블 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <UserCheck className="w-5 h-5 mr-2 text-indigo-600" />
                        사용자 세션 (User Sessions)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">총 레코드:</span>
                          <Badge variant="secondary">{tableData.userSessions?.count || 0}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          활성 로그인 세션 관리
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 데이터 샘플 미리보기 */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">데이터 미리보기 (최근 10개)</h3>
                  <Tabs defaultValue="users-preview" className="w-full">
                    <TabsList className="grid w-full grid-cols-7">
                      <TabsTrigger value="users-preview">사용자</TabsTrigger>
                      <TabsTrigger value="matches-preview">매칭</TabsTrigger>
                      <TabsTrigger value="swipes-preview">스와이프</TabsTrigger>
                      <TabsTrigger value="conversations-preview">대화</TabsTrigger>
                      <TabsTrigger value="messages-preview">메시지</TabsTrigger>
                      <TabsTrigger value="phone-preview">전화인증</TabsTrigger>
                      <TabsTrigger value="sessions-preview">세션</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users-preview">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>사용자명</TableHead>
                            <TableHead>이메일</TableHead>
                            <TableHead>크레딧</TableHead>
                            <TableHead>가입일</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.users?.data?.slice(0, 5).map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-mono text-xs">{user.id}</TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.credits || 0}</TableCell>
                              <TableCell>{user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="matches-preview">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>사용자 1</TableHead>
                            <TableHead>사용자 2</TableHead>
                            <TableHead>매칭일</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.matches?.data?.slice(0, 5).map((match: any) => (
                            <TableRow key={match.id}>
                              <TableCell className="font-mono text-xs">{match.id}</TableCell>
                              <TableCell>{match.user1Id}</TableCell>
                              <TableCell>{match.user2Id}</TableCell>
                              <TableCell>{match.createdAt ? new Date(match.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="swipes-preview">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>스와이프한 사용자</TableHead>
                            <TableHead>대상 사용자</TableHead>
                            <TableHead>방향</TableHead>
                            <TableHead>일시</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.swipes?.data?.slice(0, 5).map((swipe: any) => (
                            <TableRow key={swipe.id}>
                              <TableCell className="font-mono text-xs">{swipe.id}</TableCell>
                              <TableCell>{swipe.swiperId}</TableCell>
                              <TableCell>{swipe.swipedId}</TableCell>
                              <TableCell>
                                <Badge variant={swipe.direction === 'right' ? 'default' : 'secondary'}>
                                  {swipe.direction === 'right' ? '좋아요' : '넘김'}
                                </Badge>
                              </TableCell>
                              <TableCell>{swipe.createdAt ? new Date(swipe.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="conversations-preview">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>사용자 1</TableHead>
                            <TableHead>사용자 2</TableHead>
                            <TableHead>시작일</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.conversations?.data?.slice(0, 5).map((conv: any) => (
                            <TableRow key={conv.id}>
                              <TableCell className="font-mono text-xs">{conv.id}</TableCell>
                              <TableCell>{conv.user1Id}</TableCell>
                              <TableCell>{conv.user2Id}</TableCell>
                              <TableCell>{conv.createdAt ? new Date(conv.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="messages-preview">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>대화방</TableHead>
                            <TableHead>발신자</TableHead>
                            <TableHead>메시지</TableHead>
                            <TableHead>전송일</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.messages?.data?.slice(0, 5).map((message: any) => (
                            <TableRow key={message.id}>
                              <TableCell className="font-mono text-xs">{message.id}</TableCell>
                              <TableCell className="font-mono text-xs">{message.conversationId}</TableCell>
                              <TableCell>{message.senderId}</TableCell>
                              <TableCell className="max-w-32 truncate">{message.content}</TableCell>
                              <TableCell>{message.createdAt ? new Date(message.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="phone-preview">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>전화번호</TableHead>
                            <TableHead>인증코드</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>생성일</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.phoneVerifications?.data?.slice(0, 5).map((phone: any) => (
                            <TableRow key={phone.id}>
                              <TableCell className="font-mono text-xs">{phone.id}</TableCell>
                              <TableCell>{phone.phoneNumber}</TableCell>
                              <TableCell className="font-mono">{phone.verificationCode}</TableCell>
                              <TableCell>
                                <Badge variant={phone.verified ? 'default' : 'secondary'}>
                                  {phone.verified ? '인증완료' : '대기중'}
                                </Badge>
                              </TableCell>
                              <TableCell>{phone.createdAt ? new Date(phone.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="sessions-preview">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>사용자 ID</TableHead>
                            <TableHead>토큰</TableHead>
                            <TableHead>만료일</TableHead>
                            <TableHead>생성일</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.userSessions?.data?.slice(0, 5).map((session: any) => (
                            <TableRow key={session.id}>
                              <TableCell className="font-mono text-xs">{session.id}</TableCell>
                              <TableCell>{session.userId}</TableCell>
                              <TableCell className="font-mono text-xs max-w-32 truncate">{session.token}</TableCell>
                              <TableCell>{session.expiresAt ? new Date(session.expiresAt).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell>{session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>시스템 설정</CardTitle>
                <CardDescription>티가나 앱의 전반적인 설정을 관리하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">크레딧 패키지 설정</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span>기본 패키지</span>
                        <span className="font-semibold">3,000원 / 30크레딧</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span>인기 패키지</span>
                        <span className="font-semibold">4,900원 / 50크레딧</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span>프리미엄 패키지</span>
                        <span className="font-semibold">20,000원 / 220크레딧</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">시스템 상태</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span>카카오페이 연동</span>
                        <Badge variant="default">정상</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span>데이터베이스</span>
                        <Badge variant="default">정상</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span>API 서버</span>
                        <Badge variant="default">정상</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">관리자 작업</h3>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => loadDashboardData()}>
                      데이터 새로고침
                    </Button>
                    <Button variant="outline">
                      시스템 로그 확인
                    </Button>
                    <Button variant="outline">
                      백업 실행
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}