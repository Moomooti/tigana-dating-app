// 인증 관련 유틸리티 함수들

export const getSessionId = (): string | null => {
  return localStorage.getItem('sessionId');
};

export const setSessionId = (sessionId: string): void => {
  localStorage.setItem('sessionId', sessionId);
};

export const removeSessionId = (): void => {
  localStorage.removeItem('sessionId');
  localStorage.removeItem('savedLoginInfo');
};

export const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const sessionId = getSessionId();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (sessionId) {
    headers['Authorization'] = `Bearer ${sessionId}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

export const getCurrentUser = async () => {
  try {
    const response = await apiRequest('/api/users/current-user');
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

export const logout = (): void => {
  removeSessionId();
  window.location.reload(); // 페이지 새로고침으로 상태 초기화
};