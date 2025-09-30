// Debug utility to check authentication state
import { authApi } from '../services/mockApi';

export const debugAuth = () => {
  console.log('=== AUTH DEBUG INFO ===');
  
  // Check localStorage
  console.log('localStorage tokens:', {
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    persistence: localStorage.getItem('asagents_auth_persistence')
  });
  
  // Check sessionStorage
  console.log('sessionStorage tokens:', {
    token: sessionStorage.getItem('token'),
    refreshToken: sessionStorage.getItem('refreshToken'),
    persistence: sessionStorage.getItem('asagents_auth_persistence')
  });
  
  // Check current URL for OAuth params
  const urlParams = new URLSearchParams(window.location.search);
  console.log('URL params:', {
    code: urlParams.get('code'),
    state: urlParams.get('state'),
    pathname: window.location.pathname
  });
  
  // Check environment
  console.log('Environment:', {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    useMockApi: import.meta.env.VITE_USE_MOCK_API,
    allowMockFallback: import.meta.env.VITE_ALLOW_MOCK_FALLBACK
  });
  
  console.log('=== END AUTH DEBUG ===');
};

// Test mock API directly
export const testMockLogin = async () => {
  console.log('🧪 Testing Mock API directly...');
  try {
    const result = await authApi.login({
      email: 'sam@constructco.com',
      password: 'password123',
      rememberMe: true
    });
    console.log('✅ Mock API login successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Mock API login failed:', error);
    throw error;
  }
};

// Make it globally available for debugging
(window as any).debugAuth = debugAuth;
(window as any).testMockLogin = testMockLogin;

export default debugAuth;