"use client"

import React from 'react';
import { Grip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';

const AppNavConfig = [
  {
    path: process.env.NEXT_PUBLIC_CRM_URL || "https://crm-stg.omnisai.io",
    title: 'CASEPRO',
    icon: '/assets/logos/CRM.png',
    color: '#FF6B6B'
  },
  {
    path: process.env.NEXT_PUBLIC_AUTODOC_URL || "https://autodoc-stg.omnisai.io",
    title: 'Autodoc',
    icon: '/assets/logos/autodoc.png',
    color: '#4ECDC4'
  },
  {
    path: process.env.NEXT_PUBLIC_MEDCHRON_URL || "https://medchron-stg.omnisai.io",
    title: 'Medchron',
    icon: '/assets/logos/MedChron.png',
    color: '#95E1D3'
  },
  {
    path: process.env.NEXT_PUBLIC_LITDRAFT_URL || "https://litdraft-stg.omnisai.io",
    title: 'LitDraft',
    icon: '/assets/logos/Litdraft.png',
    color: '#3353F8'
  },
  {
    path: process.env.NEXT_PUBLIC_DEPOBRIEF_URL || "https://depobrief-stg.omnisai.io",
    title: 'DepoBrief',
    icon: '/assets/logos/Depobrief.png',
    color: '#FFD93D'
  },
  {
    path: process.env.NEXT_PUBLIC_OMNISPROOF_URL || "https://omniproof-stg.omnisai.io",
    title: 'OmnisProof',
    icon: '/assets/logos/OmniProof.svg',
    color: '#FFD93D'
  },
];

const AppSelection = () => {
  const router = useRouter();

  const handleAppSelect = (path: string) => {
    if (path !== window.location.origin) {
      window.open(path, "_blank"); // external
    } else {
      router.push(path); // internal
    }
  };

  const getCurrentApp = () => {
    console.log("AppNavConfig:", AppNavConfig);
    if (typeof window !== 'undefined') {
      return AppNavConfig.find(app => app.path && window.location.href.includes(app.path));
    }
    return null;
  };

  const currentApp = getCurrentApp();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 text-[#3353f8] bg-transparent rounded-lg transition-all duration-200 ease-in hover:bg-[#f8f9fa] cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_2px_4px_rgba(51,83,248,0.1)] focus:outline-none focus:ring-2 focus:ring-[#3353f8]/25"
        >
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip" aria-hidden="true"><circle cx="12" cy="5" r="1"></circle><circle cx="19" cy="5" r="1"></circle><circle cx="5" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle><circle cx="19" cy="19" r="1"></circle><circle cx="5" cy="19" r="1"></circle></svg>

        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='min-w-[15rem] sm:min-w-[24rem] border border-[#e5e7eb] rounded-xl ml-10 shadow-[0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)]'
        align='end'
        forceMount
      >
        <div className="px-3 py-2">
          <small className="font-semibold text-gray-500 uppercase">
            Switch Application
          </small>
        </div>
        <hr className="my-1 border-gray-200" />
        {/* App Grid */}
        <div className="grid grid-cols-2 gap-2 p-2 sm:gap-3 sm:p-3">

          {AppNavConfig.filter((item) => item.path && item.title).map((app, index) => {
            const { icon, title, path, color } = app;
            const isActive = currentApp?.path === path;

            return (
              <div key={index}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    path && handleAppSelect(path);
                  }}
                  className={`
                    relative flex items-center justify-center px-3 py-4 min-h-[70px] sm:min-h-[80px] sm:px-4 sm:py-5 rounded-xl border-2 transition-all duration-200 ease-in text-[#374151] hover:bg-[#EBF0FF] hover:border-[#5B7FFF] hover:scale-[1.02] hover:text-[#111827] 
                    ${isActive
                      ? "bg-[#3353f814] shadow-[inset_0_0_0_2px_#3353f8] hover:bg-[#3353f81f]"
                      : "border-transparent"
                    }`}
                >
                  <img
                    src={icon}
                    alt={title}
                    className="w-auto h-6 sm:h-8 sm:max-w-[160px] object-contain max-w-[120px]"
                  />
                  {isActive && (
                    <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 text-[#3353f8] bg-white rounded-full text-sm shadow-md">
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                  )}
                </a>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AppSelection