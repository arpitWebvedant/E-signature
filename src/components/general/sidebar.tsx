// components/Header.tsx
'use client'

import React, { useEffect, useRef } from 'react';
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { BookText, Folder, Settings, } from 'lucide-react'
import Image from 'next/image';


const HeaderSidebarStaticData = dynamic(
  () => import("@OmnisAIOrg/component-library").then(mod => {
    return mod.HeaderSidebarStaticData
  }),
  { ssr: false }
);


interface SidebarProps {
  sideShow?: boolean;
  setSideShow?: (value: boolean) => void;
}

export const Sidebar = ({ sideShow, setSideShow }: SidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {

    if(sidebarRef.current){
      if(sidebarRef.current.offsetWidth > 350){
        setSideShow(true);
      }else{
        setSideShow(false);
      }

      console.log(sidebarRef.current,"sidebarRef");
    }
  }, [sidebarRef]);
  // Menu data structure for HeaderSidebarStaticData component
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/dashboard",
      icon: <Image src='/assets/img/dashboard-icon.svg' alt='Dashboard Icon' width={22} height={22} />
      // icon: React.createElement(Dashboard),
    },
    {
      id: "documents",
      label: "Documents",
      path: "/documents",
      icon: <BookText />
    },
    {
      id: "folders",
      label: "Folders",
      path: "/folders",
      icon: <Folder />
    },
    {
      id: "settings",
      label: "Settings",
      path: "/settings/profile",
      icon: <Settings />
    },
  ];

  // Get the current route to determine default selected item
  const getCurrentMenuId = () => {
    const currentItem = menuItems.find((item) => item.path === pathname);
    return currentItem ? currentItem.id : "dashboard";
  };

  return (
   <div className="z-50 h-full">

     <HeaderSidebarStaticData
      menuItems={menuItems}
      ref={sidebarRef}
      isDrawerOpen={sideShow}
      defaultSelectedItem={getCurrentMenuId()}
      collapsed={false}
      onToggleCollapse={(e) => {
        console.log(e,"event");
        setSideShow(!sideShow);
      }}
    />
   </div>
  )
}
