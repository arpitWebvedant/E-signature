'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useGlobalContext } from '@/context/GlobalContext'
import centralizedAuthService from '@/services/auth/centralizedAuth'
import { LoadingScreen } from '@/components/common/LoadingScreen'

interface CentralizedAuthGuardProps {
  children: React.ReactNode
  isPublic?: boolean
  fallback?: React.ReactNode
}

const CentralizedAuthGuard: React.FC<CentralizedAuthGuardProps> = ({
  children,
  isPublic = false,
  fallback = (
    <LoadingScreen message="Securing your session and verifying credentials..." />
  ),
}) => {
  const { user, autoLoginWithCentralizedAuth } = useGlobalContext()
  const [isPublicRouteSkip, setIsPublicRouteSkip] = useState(false)
  const [initialCheckComplete, setInitialCheckComplete] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const checkInProgress = useRef(false)
useEffect(() => {
  if (isPublicRouteSkip && !isPublic) {
    setInitialCheckComplete(false)
  }
}, [isPublicRouteSkip , isPublic])
  const redirectToLogin = useCallback((returnUrl?: string) => {
    const centralizedAuthFrontendUrl =
      process.env.NEXT_PUBLIC_CENTRALIZED_AUTH_FRONTEND_URL ||
      'https://auth.omnisai.io'
    const currentUrl = returnUrl || (typeof window !== 'undefined' ? window.location.href : '/')
    const loginUrl = `${centralizedAuthFrontendUrl}/auth/login?returnUrl=${encodeURIComponent(
      currentUrl
    )}`
    console.log('🔐 Redirecting to centralized auth:', loginUrl)
    if (typeof window !== 'undefined') window.location.href = loginUrl
  }, [])

  const checkAuthentication = useCallback(async () => {
    
    if (typeof window === 'undefined') return

    // Skip auth if this route/page is marked as public
    if (isPublic) {
      console.log('🔓 Public route detected — skipping authentication')
      setInitialCheckComplete(true)
      setIsPublicRouteSkip(true)
      return
    }

    if (checkInProgress.current || isCheckingAuth) return

    checkInProgress.current = true
    setIsCheckingAuth(true)

    try {
      console.log('🔐 Checking centralized authentication...')
      if (user) {
        console.log('✅ User already authenticated in context')
        setInitialCheckComplete(true)
        return
      }

      const [sessionRes, autoRes] = await Promise.allSettled([
        centralizedAuthService.validateSession(),
        centralizedAuthService.autoLogin(),
      ])

      if (
        sessionRes.status === 'fulfilled' &&
        sessionRes.value?.success &&
        sessionRes.value?.user
      ) {
        console.log('✅ Session validated for:', sessionRes.value.user.email)
        const success = await autoLoginWithCentralizedAuth()
        if (success) {
          setInitialCheckComplete(true)
          return
        }
      }

      if (
        autoRes.status === 'fulfilled' &&
        autoRes.value?.success &&
        autoRes.value?.user
      ) {
        console.log('✅ Auto-login succeeded for:', autoRes.value.user.email)
        const success = await autoLoginWithCentralizedAuth()
        if (success) {
          setInitialCheckComplete(true)
          return
        }
      }

      console.warn('❌ Authentication failed — redirecting to login...')
      setTimeout(() => redirectToLogin(), 100)
    } catch (err) {
      console.error('🔐 Auth check failed:', err)
      setTimeout(() => redirectToLogin(), 100)
    } finally {
      checkInProgress.current = false
      setIsCheckingAuth(false)
    }
  }, [user, autoLoginWithCentralizedAuth, redirectToLogin, isCheckingAuth, isPublic])

  useEffect(() => {
    if (!initialCheckComplete && !checkInProgress.current) {
      checkAuthentication()
    }
  }, [checkAuthentication, initialCheckComplete , isPublic])


  if (!initialCheckComplete || isCheckingAuth) return fallback
  if (isPublic) return <>{children}</>
  if (user) return <>{children}</>

  return fallback
}

export default CentralizedAuthGuard
