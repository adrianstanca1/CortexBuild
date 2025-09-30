// OAuth Callback Handler for proper authentication flow
import { oauthService } from '../services/oauthService';

export class OAuthCallbackHandler {
  
  static async handleCallback(
    code: string, 
    state: string, 
    pathname: string,
    socialLoginFn: (provider: 'google' | 'facebook', profile?: { email?: string; name?: string }) => Promise<any>
  ): Promise<{ success: boolean; provider: string; userInfo?: any }> {
    
    let providerName: string;
    let userInfo: any;
    
    try {
      if (pathname === '/auth/google/callback' || (pathname === '/' && state.includes('google'))) {
        // Handle Google OAuth callback
        providerName = 'Google';
        userInfo = await oauthService.handleGoogleCallback(code, state);
        
        // Use the socialLogin function from AuthContext with the actual user info
        await socialLoginFn('google', { 
          email: userInfo.email, 
          name: userInfo.name 
        });
        
        return { success: true, provider: providerName, userInfo };
        
      } else if (pathname === '/auth/github/callback' || (pathname === '/' && state.includes('github'))) {
        // Handle GitHub OAuth callback (fallback to Google provider)
        providerName = 'GitHub';
        userInfo = await oauthService.handleGitHubCallback(code, state);
        
        // Use Google provider as fallback
        await socialLoginFn('google', { 
          email: userInfo.email, 
          name: userInfo.name 
        });
        
        return { success: true, provider: providerName, userInfo };
        
      } else {
        throw new Error('Unknown OAuth provider callback');
      }
      
    } catch (error) {
      console.error(`OAuth callback failed for ${providerName}:`, error);
      throw new Error(`${providerName} authentication failed: ${error.message}`);
    }
  }
}

export default OAuthCallbackHandler;