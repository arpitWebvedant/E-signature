import { SessionValidationResponse } from '@/types/auth'
import axios, { AxiosInstance } from 'axios';

function extractTokenFromHeaders(response: Response): string | null {
  try {
    const setCookieHeader = response.headers.get('set-cookie')
    if (setCookieHeader) {
      const tokenMatch = setCookieHeader.match(
        /better-auth\.session_token=([^;]+)/,
      )
      if (tokenMatch) {
        console.log('🍪 Extracted session token from Set-Cookie header')
        return tokenMatch[1]
      }
    }
    return null
  } catch (error) {
    console.warn('Failed to extract token from headers:', error)
    return null
  }
}

class CentralizedAuthService {
  private centralizedAuthUrl: string
  private nextAppBackendUrl: string
  private httpClient: AxiosInstance;
  private prepareAuthHeaders(headers: any): any {
    const authHeaders: any = {};
    
    // Handle Authorization header (Bearer token from frontend)
    if (headers.authorization || headers.Authorization) {
        const authHeader = headers.authorization || headers.Authorization;
        
        // If it's a Bearer token, extract the session token and send as cookie
        if (authHeader.startsWith('Bearer ')) {
            const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
            authHeaders.cookie = `better-auth.session_token=${sessionToken}`;
        } else {
            authHeaders.authorization = authHeader;
        }
    }
    
    // Also include original cookie header if present
    if (headers.cookie || headers.Cookie) {
        if (authHeaders.cookie) {
            // Append to existing cookie header
            authHeaders.cookie += `; ${headers.cookie || headers.Cookie}`;
        } else {
            authHeaders.cookie = headers.cookie || headers.Cookie;
        }
    }
    
    return authHeaders;
}
  constructor() {
    this.centralizedAuthUrl =
      process.env.NEXT_PUBLIC_CENTRALIZED_AUTH_BACKEND_URL ||
      'https://auth-app.omnisai.io'
    this.nextAppBackendUrl =
      process.env.NEXT_PUBLIC_APP_API_BASE_URL || 'https://proof-app.stg-omnisai.io'
    this.httpClient = axios.create({
      baseURL: this.centralizedAuthUrl,
      timeout: 10000,
      withCredentials: true,
    });
  }

  async validateSession(): Promise<SessionValidationResponse> {
    try {
      console.log('CentralizedAuthService: Validating session...')

      const response = await fetch(`${this.centralizedAuthUrl}/auth/session`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },

        signal: AbortSignal.timeout(5000),
      })

      console.log(
        'CentralizedAuthService: Session response status:',
        response.status,
      )

      if (!response.ok) {
        console.log('CentralizedAuthService: Session response not ok')
        return {
          success: false,
          message: 'No valid session found',
          redirectToAuth: true,
        }
      }

      const sessionData = await response.json()
      console.log('CentralizedAuthService: Session data received:', sessionData)

      let userData
      if (sessionData.success && sessionData.data?.user) {
        userData = sessionData.data
      } else if (sessionData.user) {
        userData = sessionData
      } else {
        console.log('CentralizedAuthService: No user data in session response')
        return {
          success: false,
          message: 'No valid session found',
          redirectToAuth: true,
        }
      }

      console.log(
        'CentralizedAuthService: User data extracted:',
        userData.user?.email,
      )

      let sessionToken = userData.session?.token

      if (!sessionToken) {
        sessionToken = extractTokenFromHeaders(response)
      }

      if (sessionToken) {
        localStorage.setItem('next_app_session_token', sessionToken)
        document.cookie = `better-auth.session_token=${sessionToken}; path=/; domain=${window.location.hostname};`
        console.log(
          'CentralizedAuthService: Session token cached for cross-domain use',
        )
      } else {
        console.warn(
          'CentralizedAuthService: No session token found in response or headers',
        )
      }

      try {
        console.log('CentralizedAuthService: Syncing with Next.js backend...')
        const syncResponse = await axios.post(
          `${this.nextAppBackendUrl}/api/v1/auth/sync-user`,
          {
            centralizedUser: userData.user,
          },
          {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
            timeout: 5000,
          },
        )

        console.log('CentralizedAuthService: Next.js sync successful')
        return {
          success: true,
          user: userData.user,
          localUser: syncResponse.data.localUser,
          organization: syncResponse.data.organization,
          userRole: syncResponse.data.userRole,
          session: userData.session,
        }
      } catch (syncError: any) {
        console.warn(
          'CentralizedAuthService: Failed to sync user with Next.js backend:',
          syncError,
        )

        if (
          syncError.response?.status === 403 &&
          syncError.response?.data?.organizationStatus === 'pending_approval'
        ) {
          console.log(
            'CentralizedAuthService: Organization pending approval, returning special response',
          )
          return {
            success: false,
            message:
              syncError.response.data.message ||
              'Your organization is pending approval. Please contact support for assistance.',
            organizationStatus: 'pending_approval',
            organizationName: syncError.response.data.organizationName,
            redirectToAuth: true,
          }
        }

        console.warn(
          'CentralizedAuthService: Other sync error, continuing with centralized auth data',
        )

        const primaryOrgUser = userData.user.organizationUsers?.[0]
        const organization = primaryOrgUser?.organization
        const userRole = primaryOrgUser?.role

        return {
          success: true,
          user: userData.user,
          organization: organization,
          userRole: userRole,
          session: userData.session,
        }
      }
    } catch (error: any) {
      console.error('CentralizedAuthService: Session validation error:', error)

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        console.log('CentralizedAuthService: Session validation timed out')
      }

      return {
        success: false,
        message: 'No valid session found',
        redirectToAuth: true,
      }
    }
  }

  async autoLogin(): Promise<SessionValidationResponse> {
    console.log('CentralizedAuthService: Auto-login called')

    try {
      console.log(
        'CentralizedAuthService: Checking centralized auth session...',
      )

      const sessionResponse = await fetch(
        `${this.centralizedAuthUrl}/auth/session`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },

          signal: AbortSignal.timeout(5000),
        },
      )

      if (!sessionResponse.ok) {
        console.log(
          'CentralizedAuthService: No valid centralized session found',
        )
        return {
          success: false,
          message: 'No valid session found',
          redirectToAuth: true,
        }
      }

      const sessionData = await sessionResponse.json()
      console.log('CentralizedAuthService: Centralized session validated')

      let userData
      if (sessionData.success && sessionData.data?.user) {
        localStorage.setItem("user", JSON.stringify({organizationId: sessionData.data.organization?.id}));
        userData = sessionData.data;
      } else if (sessionData.user) {
        userData = sessionData
      } else {
        console.log('CentralizedAuthService: No user data in session response')
        return {
          success: false,
          message: 'No valid session found',
          redirectToAuth: true,
        }
      }

      let sessionToken = userData.session?.token
      if (!sessionToken) {
        console.log('sessionToken',sessionToken)
        sessionToken = extractTokenFromHeaders(sessionResponse)
      }

      if (sessionToken) {
        localStorage.setItem('next_app_session_token', sessionToken)
        console.log('CentralizedAuthService: Session token cached',sessionToken)
      }

      try {
        console.log('CentralizedAuthService: Calling Next.js auto-login...')
        const autoLoginResponse = await axios.get(
          `${this.nextAppBackendUrl}/api/v1/auth/auto-login`,
          {
            headers: {
              Authorization: sessionToken
                ? `Bearer ${sessionToken}`
                : undefined,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
            timeout: 5000,
          },
        )

        if (autoLoginResponse.data.success) {
          console.log("CentralizedAuthService: Next.js auto-login successful");
          const prevUser = localStorage.getItem("user");
          const prevUserObj = prevUser ? JSON.parse(prevUser) : {};
          const updatedUser = { ...prevUserObj, ...autoLoginResponse.data.localUser };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return {
            success: true,
            user: userData.user,
            localUser: autoLoginResponse.data.localUser,
            organization: autoLoginResponse.data.organization,
            userRole: autoLoginResponse.data.userRole,
            session: userData.session,
          }
        }
      } catch (nextAppError: any) {
        console.warn(
          'CentralizedAuthService: Next.js auto-login failed, syncing manually:',
          nextAppError.message,
        )

        try {
          const syncResponse = await axios.post(
            `${this.nextAppBackendUrl}/api/v1/auth/sync-user`,
            {
              centralizedUser: userData.user,
            },
            {
              headers: {
                Authorization: `Bearer ${sessionToken}`,
                'Content-Type': 'application/json',
              },
              withCredentials: true,
              timeout: 5000,
            },
          )

          console.log('CentralizedAuthService: Manual user sync successful')
          return {
            success: true,
            user: userData.user,
            localUser: syncResponse.data.localUser,
            organization: syncResponse.data.organization,
            userRole: syncResponse.data.userRole,
            session: userData.session,
          }
        } catch (syncError: any) {
          console.warn(
            'CentralizedAuthService: Manual sync also failed:',
            syncError.message,
          )

          const primaryOrgUser = userData.user.organizationUsers?.[0]
          return {
            success: true,
            user: userData.user,
            organization: primaryOrgUser?.organization,
            userRole: primaryOrgUser?.role,
            session: userData.session,
          }
        }
      }

      const primaryOrgUser = userData.user.organizationUsers?.[0]
      return {
        success: true,
        user: userData.user,
        organization: primaryOrgUser?.organization,
        userRole: primaryOrgUser?.role,
        session: userData.session,
      }
    } catch (error: any) {
      console.error(
        'CentralizedAuthService: Auto-login completely failed:',
        error,
      )

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        console.log('CentralizedAuthService: Auto-login timed out')
      }

      return {
        success: false,
        message: 'Auto-login failed',
        redirectToAuth: true,
      }
    }
  }

  async getSession(): Promise<any> {
    try {
      const response = await fetch(`${this.centralizedAuthUrl}/auth/session`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      if (data.success && data.data) {
        return data.data
      } else if (data.user) {
        return data
      }

      return null
    } catch (error) {
      console.error('CentralizedAuthService: Failed to get session:', error)
      return null
    }
  }

  async logout(redirectToAuth = true): Promise<void> {
    if (typeof window === 'undefined') {
      console.warn('logout called during SSR');
      return;
    }

    try {
      // Clear local storage first
      localStorage.removeItem('next_app_session_token');
      localStorage.removeItem('user');

      // Try multiple possible logout endpoints
      const logoutEndpoints = [
        `${this.centralizedAuthUrl}/api/auth/sign-out`,
        `${this.centralizedAuthUrl}/api/auth/logout`,
       `${this.centralizedAuthUrl}/auth/sign-out`, 
        `${this.centralizedAuthUrl}/auth/logout`,
      ];

      let logoutSuccess = false;

      for (const endpoint of logoutEndpoints) {
        try {
          console.log('CentralizedAuthService: Trying logout endpoint:', endpoint);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          if (response.ok) {
            console.log('CentralizedAuthService: Logout successful via:', endpoint);
            logoutSuccess = true;
            break;
          } else {
            console.warn(`CentralizedAuthService: Logout failed with status ${response.status} for endpoint:`, endpoint);
          }
        } catch (error) {
          console.warn(`CentralizedAuthService: Failed with endpoint ${endpoint}:`, error);
          continue;
        }
      }

      if (!logoutSuccess) {
        console.warn('CentralizedAuthService: All logout endpoints failed, proceeding with client-side cleanup');
        window.location.href = `${this.centralizedAuthUrl}/auth/login`;
      }
    } catch (error) {
      console.error('CentralizedAuthService: Logout completely failed:', error);
    } finally {
      // Always perform client-side cleanup
      this.performClientSideCleanup();
      
      // Redirect after cleanup
      if (redirectToAuth) {
        const centralizedAuthFrontendUrl =
          process.env.NEXT_PUBLIC_CENTRALIZED_AUTH_FRONTEND_URL ||
          'https://auth.omnisai.io';
        window.location.href = `${centralizedAuthFrontendUrl}/auth/login`;
      } else {
        window.location.href = '/';
      }
    }
  }

  async logoutBySSO(headers: any) {
    try {
      await this.httpClient.post('/auth/logout', {}, {
          headers: this.prepareAuthHeaders(headers),
      });
  } catch (error : any) {
      // Logout should not throw errors - log and continue
      console.warn('CentralizedAuthService: Logout error (non-blocking):', error.message);
  }
}


  private performClientSideCleanup(): void {
    // Clear all auth-related items from localStorage
    const authKeys = [
      'next_app_session_token',
      'user',
      'auth_token',
      'session_token',
      'access_token',
      'refresh_token'
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Clear cookies (if any are set by your app)
    this.clearAuthCookies();
  }

  private clearAuthCookies(): void {
    // Clear any auth-related cookies
    const cookies = document.cookie.split(';');
    const authCookieNames = [
      'better-auth.session_token',
      'session_token',
      'auth_token',
      'access_token'
    ];

    authCookieNames.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    });
  }

  async debugAuthState(): Promise<void> {
    console.log('=== Auth Debug Information ===');
    
    // Check localStorage
    const sessionToken = localStorage.getItem('next_app_session_token');
    const userData = localStorage.getItem('user');
    
    console.log('Session token in localStorage:', sessionToken ? 'Present' : 'Missing');
    console.log('User data in localStorage:', userData ? JSON.parse(userData) : 'Missing');
    
    // Check cookies
    console.log('Document cookies:', document.cookie);
    
    // Test session validation
    try {
      const session = await this.getSession();
      console.log('Current session from auth service:', session);
    } catch (error) {
      console.log('Session validation failed:', error);
    }
    
    console.log('=== End Auth Debug ===');
  }

  redirectToCentralizedAuth(returnUrl?: string): void {
    const centralizedAuthFrontendUrl =
      process.env.NEXT_PUBLIC_CENTRALIZED_AUTH_FRONTEND_URL ||
      'https://auth.omnisai.io'
    const currentUrl = returnUrl || window.location.href
    const loginUrl = `${centralizedAuthFrontendUrl}/auth/login?returnUrl=${encodeURIComponent(
      currentUrl,
    )}`

    console.log(
      'CentralizedAuthService: Redirecting to centralized auth:',
      loginUrl,
    )
    window.location.href = loginUrl
  }

  isReturningFromAuth(): boolean {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.has('auth_return') || urlParams.has('session_token')
  }

  clearAuthParams(): void {
    const url = new URL(window.location.href)
    url.searchParams.delete('auth_return')
    url.searchParams.delete('session_token')
    window.history.replaceState({}, '', url.toString())
  }

  async login(credentials: {
    email: string
    password: string
  }): Promise<SessionValidationResponse> {
    try {
      const response = await fetch(`${this.centralizedAuthUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return this.validateSession()
      } else {
        return {
          success: false,
          message: data.message || 'Login failed',
          redirectToAuth: false,
        }
      }
    } catch (error: any) {
      console.error('CentralizedAuthService: Login failed:', error)
      return {
        success: false,
        message: 'Login failed',
        redirectToAuth: false,
      }
    }
  }

  async sendHeartbeat(): Promise<boolean> {
    try {
      const sessionToken = localStorage.getItem('next_app_session_token')

      const response = await fetch(
        `${this.centralizedAuthUrl}/session/heartbeat`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
          },
          body: JSON.stringify({
            appName: 'NextApp',
          }),
          signal: AbortSignal.timeout(5000),
        },
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log(
            'CentralizedAuthService: Heartbeat sent successfully for NextApp',
          )
          return true
        }
      }

      console.warn('CentralizedAuthService: Heartbeat failed:', response.status)
      return false
    } catch (error) {
      console.warn('CentralizedAuthService: Heartbeat error:', error)
      return false
    }
  }
  async updateLocalProfile(profileData: {
    signature: string
    fullName?: string
  }): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      console.log('CentralizedAuthService: Updating local profile only...')

      const sessionToken = localStorage.getItem('next_app_session_token')

      const response = await axios.put(
        `${this.nextAppBackendUrl}/api/v1/auth/profile`,
        profileData,
        {
          headers: {
            Authorization: sessionToken ? `Bearer ${sessionToken}` : undefined,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.data.success) {
        console.log('CentralizedAuthService: Local profile update successful')

        // Update local storage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = {
          ...currentUser,
          ...profileData,
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))

        return {
          success: true,
          message: 'Profile updated successfully',
          user: updatedUser,
        }
      } else {
        throw new Error(response.data.message || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error(
        'CentralizedAuthService: Local profile update failed:',
        error,
      )

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Profile update failed',
      }
    }
  }
  async updateProfile(profileData: {
    name: string
    signature: string
    fullName?: string
  }): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      console.log('CentralizedAuthService: Updating profile...')

      // First, get the current session to ensure user is authenticated
      const sessionResponse = await this.validateSession()

      if (!sessionResponse.success || !sessionResponse.user) {
        return {
          success: false,
          message: 'User not authenticated',
        }
      }

      const sessionToken = localStorage.getItem('next_app_session_token')

      // Update profile in the centralized auth service
      const updateResponse = await fetch(
        `${this.centralizedAuthUrl}/api/users/profile`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
          },
          body: JSON.stringify({
            name: profileData.name,
            fullName: profileData.fullName || profileData.name,
            // Add other profile fields as needed
          }),
        },
      )

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        console.error(
          'CentralizedAuthService: Profile update failed in centralized auth:',
          errorData,
        )
        throw new Error(
          errorData.message || 'Failed to update profile in centralized auth',
        )
      }

      // const updatedUserData = await updateResponse.json()
      console.log('CentralizedAuthService: Profile updated in centralized auth')

      // Now sync with the Next.js backend
      try {
        console.log(
          'CentralizedAuthService: Syncing profile with Next.js backend...',
        )

        const syncResponse = await axios.patch(
          `${this.nextAppBackendUrl}/api/v1/auth/profile`,
          {
            name: profileData.name,
            signature: profileData.signature,
            fullName: profileData.fullName || profileData.name,
          },
          {
            headers: {
              Authorization: sessionToken
                ? `Bearer ${sessionToken}`
                : undefined,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
            timeout: 5000,
          },
        )

        if (syncResponse.data.success) {
          console.log(
            'CentralizedAuthService: Profile sync with Next.js backend successful',
          )

          // Update local storage if needed
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
          const updatedUser = {
            ...currentUser,
            name: profileData.name,
            fullName: profileData.fullName || profileData.name,
            signature: profileData.signature,
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))

          return {
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser,
          }
        } else {
          throw new Error(
            syncResponse.data.message || 'Failed to sync profile with backend',
          )
        }
      } catch (syncError: any) {
        console.warn(
          'CentralizedAuthService: Failed to sync profile with Next.js backend:',
          syncError.message,
        )

        // Even if sync fails, the centralized update was successful
        return {
          success: true,
          message:
            'Profile updated in auth service but sync with backend failed',
          user: {
            ...sessionResponse.user,
            name: profileData.name,
            fullName: profileData.fullName || profileData.name,
          },
        }
      }
    } catch (error: any) {
      console.error('CentralizedAuthService: Profile update failed:', error)

      return {
        success: false,
        message:
          typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message: string }).message
            : 'Profile update failed',
      }
    }
  }
}

export default new CentralizedAuthService()
