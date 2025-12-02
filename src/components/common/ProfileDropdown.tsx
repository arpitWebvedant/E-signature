'use client'

import React, { useCallback } from 'react'
import { ChevronUp, UserRound } from 'lucide-react'
import { useGlobalContext } from '@/context/GlobalContext'

import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import Image from 'next/image'
import { formatAvatarUrl } from '../lib/utils/avatars'
import Link from 'next/link'
import { Switch } from '../ui/switch'
import axios from 'axios'

const ProfileDropDown = () => {
  const router = useRouter()
  const { user } = useGlobalContext()

  const avatarColors = [
    'bg-primary text-primary-foreground',
    // 'bg-green-100 text-green-500',
    // 'bg-purple-100 text-purple-500',
    // 'bg-orange-100 text-orange-500',
    // 'bg-pink-200 text-pink-600',
    // 'bg-indigo-100 text-indigo-500',
    // 'bg-teal-100 text-teal-500',
    // 'bg-red-100 text-red-500',
  ]
  const getInitials = (name: string) => {
    if (!name) return 'NA'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  const getAvatarColor = (email: string) => {
    const hash = email.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return avatarColors[Math.abs(hash) % avatarColors.length]
  }

  const prepareAuthHeaders = (headers: any): any => {
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
  const handleLogout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('next_app_session_token')
      const res = await axios.post(`${process.env.NEXT_PUBLIC_CENTRALIZED_AUTH_BACKEND_URL}/auth/logout`, {}, {
        headers: prepareAuthHeaders({ authorization: token }),
      });
      console.log(res)
    } catch (error) {
      // Logout should not throw errors - log and continue
      console.warn('CentralizedAuthService: Logout error (non-blocking):', error.message);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex gap-1.5 items-center  cursor-pointer'>
          {user?.data?.profilePicture ? (
            <Image
              src={
                formatAvatarUrl(user?.data?.avatarImageId) ||
                '/assets/img/user_image.png'
              }
              alt='user-profile-image'
              width={36}
              height={36}
              className='object-cover object-center rounded-md'
            />
          ) : (
            <div
              className={`w-8 h-8 rounded-md ${getAvatarColor(
                user?.data?.user?.email ?? user?.data?.fullName ?? 'User',
              )} text-xs font-semibold shadow-sm flex items-center justify-center`}
            >
              <p className='text-xs font-semibold mb-0.5'>
                {getInitials(
                  user?.data?.user?.name ?? user?.data?.fullName ?? 'User',
                )}
              </p>
            </div>
          )}

          <div className='hidden flex-col justify-between lg:flex'>
            <p className='text-sm text-[#1F1F21]'>
              {user?.data?.user?.name ?? user?.data?.fullName ?? 'User'}
            </p>
            <p className='text-xs -mt-0.5 text-[#787878]'>{user?.data?.user?.email ?? 'not available'}</p>
          </div>
          <button className='hidden ml-1 w-5 h-5 lg:block'>

            <ChevronUp className='text-black rotate-180' size={24} />
          </button>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='min-w-[15rem] p-2 w-fit border border-[#e5e7eb] rounded-xlshadow-[0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)]'
        align='end'
        forceMount
      >
        <Link href='/settings/profile' className=''>
          <div className='w-full py-2 px-3 flex items-center gap-2 rounded-md transition-all ease-in font-medium text-sm text-[#4E617C] duration-200 hover:translate-x-[2px] hover:bg-[#F9FAFF] hover:text-[#3353F8]'>
            <UserRound size={18} />
            My Profile
          </div>
        </Link>

        <div className='py-1'>
          <hr />
        </div>
        <button className='w-full' onClick={() => handleLogout()}>
          <div className='w-full py-2 px-3 flex items-center justify-between gap-2 rounded-md transition-all ease-in font-medium text-sm text-[#EC4E2C] duration-200 hover:translate-x-[2px] hover:bg-red-100/50'>
            <div className='flex gap-2 items-center'>
              <Image
                src='/assets/img/log-out-icon.svg'
                alt='sign-out-icon'
                width={18}
                height={18}
              />
              Log Out
            </div>
          </div>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropDown
