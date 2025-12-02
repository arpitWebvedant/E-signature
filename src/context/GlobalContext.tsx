'use client'

import { GlobalUser } from '@/components/schema/types'
import centralizedAuthService from '@/services/auth/centralizedAuth'
import axios from 'axios'
import { createContext, ReactNode, useContext, useState } from 'react'

interface GlobalContextType {
  user: GlobalUser | null
  setUser: (user: GlobalUser | null) => void
  isUsingCentralizedAuth: boolean
  validateCentralizedSession: () => Promise<any>
  autoLoginWithCentralizedAuth: () => Promise<boolean>
  checkAuthenticationByApiKey: (apiKey: string) => Promise<boolean>
}

const GlobalContext = createContext<GlobalContextType | undefined>(
  undefined
)

export const GlobalContextProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [user, setUser] = useState<GlobalUser | null>(null)
  const [isUsingCentralizedAuth, setIsUsingCentralizedAuth] = useState(false)

  const validateCentralizedSession = async () => {
    try {
      const result = await centralizedAuthService.validateSession()
      return result
    } catch (error) {
      console.error('Failed to validate centralized session:', error)
      return { success: false, message: 'Session validation failed' }
    }
  }

  const autoLoginWithCentralizedAuth = async (): Promise<boolean> => {
    try {
      const result = await centralizedAuthService.autoLogin()

      if (result.success && result.user) {
        const existingSelectedData = localStorage.getItem('selectedData')

        const userData: GlobalUser = {
          data: {
            _id: result.localUser?._id || result.user.id,
            email: result.user.email,
            fullName: result.localUser.fullName,
            profilePicture: result.user.image,
            centralizedUserId: result.user.id,
            isCentralizedAuth: true,
            role: result.userRole?.name || 'admin',
            user: {
              _id: result.localUser?._id || result.user.id,
              email: result.user.email,
              fullName: result.localUser.fullName,
              name: result.user.name,
              profilePicture: result.user.image,
              centralizedUserId: result.user.id,
              isCentralizedAuth: true,
              signature: result.localUser?.signature,
              role: result.userRole?.name || 'admin',
            },
          },
          token:
            result.session?.token ||
            localStorage.getItem('next_app_session_token') ||
            '',
        }

        await loginUser(userData)
        setIsUsingCentralizedAuth(true)

        if (existingSelectedData) {
          localStorage.setItem('selectedData', existingSelectedData)
        }

        return true
      } else {
        if (result.redirectToAuth) {
          centralizedAuthService.redirectToCentralizedAuth()
        }
        return false
      }
    } catch (error) {
      console.error('Auto-login failed:', error)
      return false
    }
  }

  const checkAuthenticationByApiKey = async (apiKey: string): Promise<boolean> => {
    try {
    
 
      const url = `${process.env.NEXT_PUBLIC_APP_API_BASE_URL}/api/v1/auth/check-auth-by-api-key?apiKey=${apiKey}`
   
      const res = await axios.get(url, { timeout: 10000 }) // optional timeout
      const result = res.data
      console.log('✅ API Key check success:', result.data)
      const userData: GlobalUser = {
        data: {
          _id: result.localUser?._id ||result.localUser?.id || result.user.id,
          email: result?.localUser?.email || result?.user?.email,
          fullName: result?.localUser?.fullName || result?.user?.fullName,
          profilePicture: result?.localUser?.image,
          centralizedUserId: result?.localUser?.id || result?.user?.id,
          isCentralizedAuth: true,
          role: result?.userRole?.name || 'admin',
          user: {
            _id: result.localUser?._id || result.localUser?.id || result.user.id,
            email: result?.localUser?.email || result?.user?.email,
            fullName: result?.localUser?.fullName || result?.user?.fullName,
            name: result?.localUser?.name || result?.user?.name,
            profilePicture: result?.localUser?.image || result?.user?.image,
            centralizedUserId: result?.localUser?.id || result?.user?.id,
            isCentralizedAuth: true,
            signature: result?.localUser?.signature,
            role: result?.userRole?.name || 'admin',
          },
        },
        token:
          result.session?.token ||
          localStorage.getItem('next_app_session_token') ||
          '',
      }
      localStorage.setItem("user", JSON.stringify(result.localUser));
      
      await loginUser(userData)
      return result.data.success
    } catch (error: any) {
      console.error('❌ Failed to check authentication by API key:', error.message)
      if (error.response) console.error('Response data:', error.response.data)
      return false
    }
  }

  const loginUser = async (userData: GlobalUser) => {
    setUser(userData)
    localStorage.setItem('next_app_session_token', userData.token)
    // Add additional logic if needed
  }
  const handleLogout = async () => {
    try {
      await centralizedAuthService.logoutBySSO(true); // true = redirect to auth login
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear local state and redirect
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const contextValue: GlobalContextType = {
    user,
    setUser,
    isUsingCentralizedAuth,
    validateCentralizedSession,
    autoLoginWithCentralizedAuth,
    checkAuthenticationByApiKey,
    handleLogout,
  }

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error(
      'useGlobalContext must be used within a GlobalContextProvider'
    )
  }
  return context
}
