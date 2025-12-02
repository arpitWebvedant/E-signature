// app/settings/layout.tsx
'use client'

import { SettingsDesktopNav } from '@/components/general/settings-nav-desktop'
import { SettingsMobileNav } from '@/components/general/settings-nav-mobile'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full h-full">
      <div className="rounded-lg bg-white border border-[#EAECF0] shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-[#EAECF0]">
          <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">
            Keep track of documents and their security ratings.
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-12 gap-6 p-6">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-2">
            <div className="hidden md:block">
              <SettingsDesktopNav />
            </div>
            <div className="mb-6 md:hidden">
              <SettingsMobileNav />
            </div>
          </aside>

          {/* Main content */}
          <main className="col-span-12 md:col-span-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
