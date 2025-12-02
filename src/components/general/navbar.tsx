// components/Navbar.tsx
'use client'

import React from 'react';
import { usePathname, useRouter } from "next/navigation";
import {  Bell } from 'lucide-react'
import Image from 'next/image';
import AppSelection from './app-selection';
import { Menu as MenuIcon, Plus as PlusIcon, Search as SearchIcon } from "lucide-react";
import ProfileDropDown from '../common/ProfileDropdown';


interface NavbarProps {
  sideShow: boolean;
  setSideShow: (value: boolean) => void;
  isMenu?: boolean;
}

export const Navbar = ({ sideShow, setSideShow, isMenu = true }: NavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between gap-4 pl-4 pr-6 py-2 bg-white border-b border-[#e6ebf0]">
      <div className="flex gap-1 items-center">
        {isMenu && (
          <Image
            src="/assets/img/hamberger_menu_icon.svg"
            alt="hamberger_menu_icon"
            className="h-auto cursor-pointer lg:hidden"
            width={30}
            height={30}
            onClick={() => setSideShow(!sideShow)}
          />
          
        )}

        <AppSelection />

        <Image
          src="/assets/logos/OmniProof.svg"
          alt="Omni proof logo"
          width={160}
          height={30}
          className="object-contain mt-1 cursor-pointer"
          onClick={() => router.push("/")}
        />
      </div>

      {isMenu && (
        <div className="flex gap-1 items-center">
          {/* History Button */}
          {/* <button className='cursor-pointer rounded-md w-8 h-8 flex justify-center items-center border border-[#E6EBF0]'>
            <Bell size={16} className="text-[#1F1F21]"/>
          </button> */}
          <ProfileDropDown />
        </div>
      )}
    </header>

  )
}
