// components/Header.tsx
'use client'

import {  MenuIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MenuSwitcher } from '../common/menu-switcher'

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 flex h-16 w-full items-center backdrop-blur transition-all duration-200 ${
        isScrolled
          ? 'border-b border-border bg-background/95'
          : 'bg-background/80'
      }`}
    >
      <div className='flex justify-between items-center px-4 mx-auto w-full max-w-7xl sm:px-6 lg:px-8'>
        {/* Logo */}
        <Link href='/' className='hidden md:inline-flex'>
  OmnisAI ESignature
        </Link>

    

        {/* Right Side Icons */}
        <div className='hidden md:flex md:items-center md:gap-4'>

          <div className='md:ml-4'>
            <MenuSwitcher />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className='flex gap-4 items-center md:hidden'>
          <button
            className='p-2 text-muted-foreground hover:text-foreground'
          >
            <SearchIcon className='w-6 h-6' />
            <span className='sr-only'>Search</span>
          </button>
          <button

            className='p-2 text-muted-foreground hover:text-foreground'
          >
            <MenuIcon className='w-6 h-6' />
            <span className='sr-only'>Open menu</span>
          </button>
        </div>
      </div>
    </header>
  )
}
